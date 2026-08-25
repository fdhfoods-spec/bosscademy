import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import PageHero from '@/components/public/PageHero'
import ProgramDetailCard from '@/components/public/ProgramDetailCard'
import { programs as staticPrograms, type CourseProgram } from '@/lib/programs'
import { supabase, IS_MOCK_SUPABASE } from '@/lib/supabase'
import { getMockCourses } from '@/lib/mockData'
import type { Course } from '@/types'

export default function Programs() {
  const [dynamicCourses, setDynamicCourses] = useState<CourseProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let courses: Course[] = []
        if (IS_MOCK_SUPABASE) {
          courses = getMockCourses().filter(c => c.status === 'Published')
        } else {
          const { data } = await supabase.from('courses').select('*').eq('status', 'Published')
          if (data) courses = data as Course[]
        }

        // Map dynamic courses to CourseProgram format
        const mappedCourses: CourseProgram[] = courses.map(course => ({
          id: course.id,
          title: course.title,
          outcome: course.category || 'Professional Development',
          duration: course.duration || 'Flexible',
          summary: course.description || 'A comprehensive training program.',
          icon: BookOpen as any,
          whatYouLearn: [],
          toolsCovered: [],
          realWorldApplication: '',
          whoFor: [],
          heroSubtitle: '',
          ableToDo: [],
          learnByDoing: { intro: '', tasks: [] },
          courseDetails: { mode: 'Online', support: 'Community support' },
          whyThisCourse: [],
          faq: []
        }))

        // Filter out dynamic courses that might already be in our static list by title
        const existingTitles = staticPrograms.map(p => p.title.toLowerCase())
        const uniqueDynamic = mappedCourses.filter(
          c => !existingTitles.includes(c.title.toLowerCase())
        )

        setDynamicCourses(uniqueDynamic)
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const allPrograms = [...staticPrograms, ...dynamicCourses]

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        eyebrow="Our programs"
        title="Courses for students & job seekers"
        subtitle="Practical training in office skills, data analytics, and digital marketing. Clear structure, honest expectations, and support when you need it."
        conversionCtas={{ primaryHref: '#programs' }}
      />

      <div className="bg-surface border-b border-slate-100/90">
        <p className="section-container py-3 text-center text-sm text-slate-600">
          Limited seats per batch · New batches starting regularly · Focused on practical, real-world skills
        </p>
      </div>

      <div id="programs" className="section-container py-20 md:py-28 scroll-mt-24">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {allPrograms.map((program) => (
              <ProgramDetailCard key={program.id} program={program} />
            ))}
          </div>
        )}

        <div className="mt-16 md:mt-20 max-w-3xl mx-auto text-center rounded-card bg-white border border-slate-200/90 shadow-sm p-8 md:p-10">
          <h2 className="font-heading text-lg md:text-xl font-bold text-slate-900 mb-2">
            Hospitals, schools, or companies?
          </h2>
          <p className="text-slate-600 text-sm md:text-base mb-4 leading-relaxed">
            Custom training for organizations lives on our Partnerships page, not here. This page is for individual
            learners (students, freshers, career switchers).
          </p>
          <Link
            to="/partnerships"
            className="inline-block font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Enterprise &amp; partnerships →
          </Link>
        </div>
      </div>
    </div>
  )
}
