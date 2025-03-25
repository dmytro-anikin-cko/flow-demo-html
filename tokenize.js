/* global CheckoutWebComponents */
(async () => {
    const PUBLIC_KEY = "pk_sbox_guri7tp655hvceb3qaglozm7gee";
  
    // If no session in localStorage, create a new payment session
    const response = await fetch(
      "https://api.sandbox.checkout.com/payment-sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer sk_sbox_odyoauybjpcfbkzmgsnnbiub4mj`,
        },
        body: JSON.stringify({
          processing_channel_id: "pc_w2njpb6jbjjujgcz5dgzxdn5mm",
          currency: "EUR", // Necessary for iDeal and Sofort
          amount: 1000,
          reference: `ORD-1234`,
          payment_type: "Unscheduled",
          "3ds": {
            enabled: true,
          },
          billing: {
            address: {
              country: "FR", // Necessary for SEPA
              address_line1: "Osdorpplein 137", // NECESSARY!!!! Can be random for Klarna
              // address_line2: "Flat 456", // Not necessary. Can be random for Klarna
              city: "Amsterdam", // NECESSARY!!!! Can be random for Klarna
              zip: "1068 SR", // NECESSARY!!!! Can be random for Klarna
            },
          },
          success_url: "https://checkout.checkout.test.success",
          failure_url: "https://checkout.checkout.test.failure",
        }),
      }
    );
  
    let paymentSession = await response.json();
  
    if (!response.ok) {
      console.error("Error creating payment session", paymentSession);
      return;
    }
  
    /* 
        Initialize and mount Flow
    */
    const checkout = await CheckoutWebComponents({
      publicKey: PUBLIC_KEY,
      environment: "sandbox",
      locale: "fr-FR", // en-GB, fr-FR...
      /* Custom PAY button */
      showPayButton: false,
      paymentSession,
      onReady: () => {
        console.log("onReady");
      },
      onPaymentCompleted: (_component, paymentResponse) => {
        console.log("Create Payment with PaymentId: ", paymentResponse.id);
      },
      onChange: (component) => {
        console.log(
          `onChange() -> isValid: "${component.isValid()}" for "${
            component.type
          }"`
        );
      },
      onSubmit: (_self) => {
        // Show loading overlay to prevent further user interaction
        console.log(_self);
        // debugger;
      },
      onError: (component, error) => {
        console.log("onError", error, "Component", component.type);
      },
    });
  
    const flowComponent = checkout.create("card");
  
    // Check that Card component is available before mounting
    if (await flowComponent.isAvailable()) {
      flowComponent.mount("#flow-container");
    }
  
    // flowComponent.mount(document.getElementById("flow-container"));
  
    /* Custom PAY button */
    const submitButton = document.getElementById("submit");
  
    // submitButton.addEventListener("click", () => {
    //   console.log(flowComponent.isValid());
  
    //   if (flowComponent.isValid()) {
    //     flowComponent.submit();
    //   }
    // });
    submitButton.addEventListener('click', async () => {
      const { data } = await flowComponent.tokenize();
      console.log(data);
      
    
      await utilizeToken(data.token);
    });
    
  })();
  
  // Helper function to show toasts
  function triggerToast(id) {
    var element = document.getElementById(id);
    element.classList.add("show");
  
    setTimeout(function () {
      element.classList.remove("show");
    }, 5000);
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get("status");
  const paymentId = urlParams.get("cko-payment-id");
  
  if (paymentStatus === "succeeded") {
    triggerToast("successToast");
  }
  
  if (paymentStatus === "failed") {
    triggerToast("failedToast");
  }
  
  if (paymentId) {
    console.log("Create Payment with PaymentId: ", paymentId);
  }
  