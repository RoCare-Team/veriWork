export const VERIFICATION_STEPS = [

  {

    id: 'profile',

    step: 1,

    title: 'Create your profile',

    subtitle: 'Name, role & contact details',

    description: 'Tell us who you are so we can build your Professional ID.',

    status: 'pending',

    to: '/employee/profile-setup',

    duration: '~1 min',

  },

  {

    id: 'aadhaar',

    step: 2,

    title: 'Link Aadhaar',

    subtitle: 'Secure e-KYC via DigiLocker',

    description: 'Verify your government ID through DigiLocker or Aadhaar OTP.',

    status: 'pending',

    to: '/employee/verification/aadhaar',

    duration: '~2 min',

  },

  {

    id: 'biometric',

    step: 3,

    title: 'Biometric check',

    subtitle: 'Live face match with ID photo',

    description: 'A quick selfie to confirm you are the Aadhaar holder.',

    status: 'pending',

    to: '/employee/verification/biometric',

    duration: '~1 min',

  },

]



export const VERIFICATION_STEP_LABELS = {

  profile: 'Profile',

  aadhaar: 'Aadhaar',

  biometric: 'Biometric',

  complete: 'Complete',

}


