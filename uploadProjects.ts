import {createClient} from '@sanity/client'
import projects from './data/projects.json' // assumes tsconfig has resolveJsonModule + esModuleInterop
import {config} from 'dotenv'
import {Project as SanityProject} from '../../portfolio/types/sanity'
config()

export const sanity = createClient({
  projectId: 'imgj1a23',
  dataset: 'production',
  apiVersion: '2025-04-03',
  token: process.env.API_TOKEN,
  useCdn: false,
})

type Project = {
  title: string
  image: {alt: string}
  summary: string
  link: string
  github?: string
  description: string
  technologies: string[]
}

type SkillRef = {_type: 'reference'; _ref: string}

// Assuming that the category for each technology can be inferred from the technology name itself, or some mapping
const categoryMap: Record<string, string> = {
  React: 'Frontend',
  'Node.js': 'Backend',
  Git: 'Tools',
  Figma: 'Design',
  // Add more mappings as needed
}

async function uploadSkillsAndGetMap(): Promise<Record<string, string>> {
  const techSet = new Set<string>()
  projects.forEach((project: Project) => {
    project.technologies.forEach((tech) => tech && techSet.add(tech))
  })

  const skillMap: Record<string, string> = {}

  for (const tech of techSet) {
    const category = categoryMap[tech] ?? ''

    // Fetch existing skill document by category and item
    const existing = await sanity.fetch(
      `*[_type == "skill" && category == $category && items[0] == $tech][0]{_id}`,
      {
        category: category,
        tech: tech,
      },
    )

    let skill
    if (existing?._id) {
      skill = existing
    } else {
      skill = await sanity.create({
        _type: 'skill',
        category: category,
        name: tech,
        featured: true,
      })
    }

    skillMap[tech] = skill._id
    console.log(`✅ Skill ready: ${tech} (${skill._id})`)
  }

  return skillMap
}

async function uploadProjects(skillMap: Record<string, string>) {
  for (const project of projects) {
    try {
      const techRefs: SkillRef[] = project.technologies
        .filter((t) => skillMap[t])
        .map((t) => ({
          _type: 'reference',
          _ref: skillMap[t],
        }))

      const doc: SanityProject = {
        _type: 'project',
        title: project.title,
        summary: project.summary,
        liveUrl: project.link,
        githubUrl: project.github || '',
        featured: true,
        description: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: project.description,
                marks: [],
              },
            ],
            markDefs: [],
            style: 'normal',
          },
        ],
        technologies: techRefs,
      }

      // Check if the project already exists to prevent duplicates
      const existingProject = await sanity.fetch(
        `*[_type == "project" && title == $title][0]._id`,
        {title: project.title},
      )

      if (!existingProject) {
        await sanity.create(doc)
        console.log(`🚀 Uploaded project: ${project.title}`)
      } else {
        console.log(`🚀 Project already exists: ${project.title}`)
      }
    } catch (err) {
      console.error(`❌ Error uploading "${project.title}":`, err)
    }
  }
}

async function main() {
  const skillMap = await uploadSkillsAndGetMap()
  await uploadProjects(skillMap)
}

main()
