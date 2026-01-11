import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">IM</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to IELTSMaster
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master your IELTS writing with AI-powered feedback and practice tests
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Choose Your Test Type
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <TestTypeCard
                title="Academic Training"
                description="For students applying to higher education or professional registration"
                testType="academic"
              />
              <TestTypeCard
                title="General Training"
                description="For those migrating to English-speaking countries or training programs"
                testType="general"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              How It Works
            </h3>
            <div className="space-y-4">
              <Step number={1} title="Select Test Type" description="Choose Academic or General Training" />
              <Step number={2} title="Choose Task" description="Select Task 1 (20 min) or Task 2 (40 min)" />
              <Step number={3} title="Write Your Response" description="Complete your writing with our timer and word counter" />
              <Step number={4} title="Get AI Feedback" description="Receive detailed scoring on all 4 IELTS criteria" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestTypeCard({ title, description, testType }: { title: string; description: string; testType: string }) {
  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50">
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 text-sm">{description}</p>
      <div className="space-y-3">
        <Link
          href={`/test/${testType}/task1`}
          className="block w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg text-center font-medium"
        >
          Start Task 1 (150 words, 20 min)
        </Link>
        <Link
          href={`/test/${testType}/task2`}
          className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-center font-medium"
        >
          Start Task 2 (250 words, 40 min)
        </Link>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
