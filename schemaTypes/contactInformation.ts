import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'contactInformation',
  title: 'Contact Information',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Personal Website',
      type: 'url',
    }),
    defineField({
      name: 'linkedin',
      title: 'LinkedIn Profile',
      type: 'url',
    }),
    defineField({
      name: 'github',
      title: 'GitHub Profile',
      type: 'url',
    }),
  ],
})
