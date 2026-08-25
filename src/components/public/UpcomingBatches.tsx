import { Link } from 'react-router-dom'

const batches = [
  {
    program: 'Hospital Staff Training',
    startDate: 'July 10',
    seats: 25,
  },
  {
    program: 'EV Technician',
    startDate: 'July 15',
    seats: 20,
  },
  {
    program: 'AI for Students',
    startDate: 'July 20',
    seats: 30,
  },
]

export default function UpcomingBatches() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Upcoming Training Batches
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-2">
            Reserve your seat in our next batch of high-impact training programs.
          </p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Limited seats available. Early registration recommended.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-lg bg-background">
          <table className="min-w-full divide-y divide-background-dark">
            <thead className="bg-background-light">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background-dark">
              {batches.map((batch) => (
                <tr key={batch.program} className="hover:bg-background-light transition">
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-slate-900">
                    {batch.program}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">
                    {batch.startDate}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        batch.seats >= 25
                          ? 'bg-green-100 text-green-700'
                          : batch.seats >= 10
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {batch.seats} Seats Left
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-right">
                    <Link
                      to="/register"
                      className="btn-cta px-4 py-2 text-xs sm:text-sm shadow hover:scale-105"
                    >
                      Start Learning Now
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

