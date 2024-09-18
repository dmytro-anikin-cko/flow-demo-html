/* global CheckoutWebComponents */
(async () => {
  const PUBLIC_KEY = "pk_sbox_guri7tp655hvceb3qaglozm7gee";

  let paymentSession;

  // Check if paymentSession is stored in localStorage
  const savedPaymentSession = localStorage.getItem("paymentSession");

  if (savedPaymentSession) {
    // If there's a stored session, use it
    paymentSession = JSON.parse(savedPaymentSession);
    console.log("Loaded paymentSession from localStorage:", paymentSession);
  } else {
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
          currency: "EUR",
          amount: 1345,
          reference: `ORD-2234`,
          "3ds": {
            enabled: true,
          },
          billing: {
            address: {
              country: "GB", // GB
            },
          },
          success_url: "https://checkout.checkout.test.success",
          failure_url: "https://checkout.checkout.test.failure",
        }),
      }
    );

    paymentSession = await response.json();

    if (!response.ok) {
      console.error("Error creating payment session", paymentSession);
      return;
    }

    // Save the paymentSession to localStorage
    localStorage.setItem("paymentSession", JSON.stringify(paymentSession));
    console.log("Saved paymentSession to localStorage:", paymentSession);
  }

  /* 
      Initialize and mount Flow
  */
  const checkout = await CheckoutWebComponents({
    publicKey: PUBLIC_KEY,
    environment: "sandbox",
    locale: "en-GB", // en-GB, fr-FR...
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
      debugger;
    },
    onError: (component, error) => {
      console.log("onError", error, "Component", component.type);
    },
  });

  const flowComponent = checkout.create("flow");

  flowComponent.mount(document.getElementById("flow-container"));
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
