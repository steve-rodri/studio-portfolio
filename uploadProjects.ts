import {createClient} from '@sanity/client'
import projects from './data/projects.json' // assumes tsconfig has resolveJsonModule + esModuleInterop

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

async function uploadSkillsAndGetMap(): Promise<Record<string, string>> {
  const techSet = new Set<string>()
  projects.forEach((project: Project) => {
    project.technologies.forEach((tech) => tech && techSet.add(tech))
  })

  const skillMap: Record<string, string> = {}

  for (const tech of techSet) {
    const existing = await sanity.fetch(`*[_type == "skill" && name == $name][0]{_id}`, {
      name: tech,
    })
    const skill = existing?._id ? existing : await sanity.create({_type: 'skill', name: tech})

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

      const doc = {
        _type: 'project',
        title: project.title,
        summary: project.summary,
        link: project.link,
        github: project.github || '',
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

      await sanity.create(doc)
      console.log(`🚀 Uploaded project: ${project.title}`)
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
