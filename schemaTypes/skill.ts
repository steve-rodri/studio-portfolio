import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'skill',
  title: 'Skill',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Skill Name',
      type: 'string',
    }),
    defineField({
      name: 'level',
      title: 'Proficiency Level',
      type: 'string', // You could also use an enum-like dropdown
      options: {
        list: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      },
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
  ],
})
