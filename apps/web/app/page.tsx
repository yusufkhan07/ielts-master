import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            IELTSMaster
          </h1>
          <p className="text-xl text-gray-600">
            Master your IELTS writing with AI-powered feedback
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
    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-500 transition-colors">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="space-y-3">
        <Link
          href={`/test/${testType}/task1`}
          className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
        >
          Start Task 1 (150 words, 20 min)
        </Link>
        <Link
          href={`/test/${testType}/task2`}
          className="block w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
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
