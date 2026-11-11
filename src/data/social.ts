export interface SocialLink {
  id: string;
  name: string;
  url: string;
  display: string;
  iconName: string;
}

export const socialData = {
  email: 'saulrendoncocom@gmail.com',
  github: 'https://github.com/saulrendon',
  linkedin: 'https://linkedin.com/in/saul-rendon',
  location: 'Cancún, Quintana Roo, México',
  coordinates: '21.1619° N, 86.8515° W',
  links: [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com/saulrendon',
      display: 'github.com/saulrendon',
      iconName: 'Github',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/saul-rendon',
      display: 'linkedin.com/in/saul-rendon',
      iconName: 'Linkedin',
    },
    {
      id: 'email',
      name: 'Email Directo',
      url: 'mailto:saulrendoncocom@gmail.com',
      display: 'saulrendoncocom@gmail.com',
      iconName: 'Mail',
    },
  ],
};
