/**
 * Static page copy. `{store}` is replaced with the store name at render time.
 * Each section has a heading plus `paragraphs` and/or a bulleted `list`.
 *
 * NOTE: legal/policy wording here is starter text. Have it reviewed by counsel
 * and adjust to your real shipping, returns and data-handling practices before launch.
 */
export const CONTENT_PAGES = {
  about: {
    title: 'About us',
    intro: '{store} makes everyday clothing from organic cottons and breathable linens, designed to be worn often and kept for years.',
    sections: [
      {
        heading: 'What we believe',
        paragraphs: [
          'Good clothes should be comfortable, honest about where they come from, and built to last. We work with small mills and keep our collections focused, so every piece earns its place in your wardrobe.',
        ],
      },
      {
        heading: 'How we make things',
        list: [
          'Natural, responsibly sourced fibres such as organic cotton and linen.',
          'Small production runs to reduce waste.',
          'Fair pay and safe conditions at every partner we work with.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact us',
    intro: 'We usually reply within one business day. For anything about an order, have your order number ready.',
    sections: [
      {
        heading: 'Support hours',
        paragraphs: ['Monday to Saturday, 9:00 to 18:00 (local time). Closed on public holidays.'],
      },
      {
        heading: 'Before you write',
        list: [
          'Track an order or request a return from My account > Orders.',
          'Update addresses and notification preferences from My account.',
          'We will never ask for your one-time code, by phone, chat or email.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping policy',
    intro: 'How and when we deliver your order.',
    sections: [
      {
        heading: 'Delivery times',
        list: [
          'Standard: 3 to 7 business days after dispatch.',
          'Orders are packed within 1 to 2 business days.',
          'You will receive tracking details as soon as your parcel ships.',
        ],
      },
      {
        heading: 'Shipping costs',
        paragraphs: ['Shipping is free on orders over $50. Below that, the cost is shown at checkout before you pay.'],
      },
      {
        heading: 'Delivery problems',
        paragraphs: ['If your parcel is delayed, damaged or missing, contact us and we will investigate with the carrier and make it right.'],
      },
    ],
  },
  returns: {
    title: 'Return & exchange policy',
    intro: 'Changed your mind or got the wrong size? You have 30 days from delivery.',
    sections: [
      {
        heading: 'What can be returned',
        list: [
          'Items in their original condition: unworn, unwashed, with tags attached.',
          'Requests made within 30 days of delivery.',
          'Final-sale items and personalised products cannot be returned.',
        ],
      },
      {
        heading: 'How to return',
        list: [
          'Go to My account > Orders, open the order and choose Return items.',
          'Pick the items and a reason. We email a prepaid label within 24 hours.',
          'Refunds go to your original payment method within 5 to 7 business days of us receiving the parcel.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'What we collect, why, and the control you have over it.',
    sections: [
      {
        heading: 'What we collect',
        list: [
          'Account details: your name, mobile number and optional email.',
          'Delivery details: the addresses you save or enter at checkout.',
          'Order history and returns.',
          'Basic device information for security, such as your browser and approximate sign-in time.',
        ],
      },
      {
        heading: 'How we use it',
        paragraphs: [
          'To process and deliver your orders, keep your account secure, provide support, and (only if you opt in) send offers. We do not sell your personal data.',
        ],
      },
      {
        heading: 'How we protect it',
        list: [
          'Sign-in uses one-time codes: there is no password to leak.',
          'Sessions end after inactivity and you can sign out of every device from Login & security.',
          'Sensitive actions, like deleting your account, need you to re-verify your identity.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          'You can edit your details, manage notification preferences, and permanently delete your account from My account at any time. Order records we are legally required to keep are retained without your personal details.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & conditions',
    intro: 'The rules for using {store}.',
    sections: [
      {
        heading: 'Your account',
        list: [
          'You are responsible for activity on your account and for keeping your one-time codes private.',
          'Provide accurate information and keep your contact details up to date.',
        ],
      },
      {
        heading: 'Orders and pricing',
        paragraphs: [
          'An order is accepted when we dispatch it. Prices and availability can change; we will tell you before charging you if an item is unavailable.',
        ],
      },
      {
        heading: 'Returns and refunds',
        paragraphs: ['Governed by our return & exchange policy.'],
      },
      {
        heading: 'Changes',
        paragraphs: ['We may update these terms. Significant changes will be announced in your account or by message.'],
      },
    ],
  },
};
