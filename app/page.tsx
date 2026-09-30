import Link from "next/link";
import {
  BarChart3,
  Brain,
  CheckCircle2,
  Clock3,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-900">
                StudyTrack{" "}
                <span className="text-blue-500">
                  Lite
                </span>
              </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-16 text-center md:pt-24">
        <div className="mb-6 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Study smarter. Understand your habits.
        </div>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Understand how you study.
          <span className="block text-blue-600">
            Improve how you perform.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          StudyTrack helps you track your study sessions, measure your
          productivity, discover behavioural patterns, and turn your data into
          useful insights.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Start Tracking
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-200 px-6 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            I already have an account
          </Link>
        </div>

        {/* Slogan */}
        <p className="mt-8 text-sm font-medium text-gray-500">
          Track behaviour → measure outcome → improve.
        </p>
      </section>

      {/* Feature cards */}
      <section className="border-t border-gray-100 bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to understand your study habits
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-600">
              Turn your study sessions into meaningful information that helps
              you make better decisions about how you study.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Session Tracking */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={22} />
              </div>

              <h3 className="text-lg font-semibold">
                Track Your Sessions
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Record what you studied, how long you studied, your energy,
                focus, and productivity.
              </p>
            </div>

            {/* Analytics */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <BarChart3 size={22} />
              </div>

              <h3 className="text-lg font-semibold">
                Analyze Your Behaviour
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                See patterns in your study duration, productivity, focus,
                consistency, and session types.
              </p>
            </div>

            {/* Insights */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Brain size={22} />
              </div>

              <h3 className="text-lg font-semibold">
                Discover What Works
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Turn your study data into personalized insights that help you
                understand what works best for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              How StudyTrack works
            </h2>

            <p className="mt-3 text-gray-600">
              A simple loop for continuously improving your study habits.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                1
              </div>

              <h3 className="mt-4 font-semibold">
                Track
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Record your study sessions and how you felt and performed.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                2
              </div>

              <h3 className="mt-4 font-semibold">
                Measure
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Analyze your productivity, focus, duration, and consistency.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                3
              </div>

              <h3 className="mt-4 font-semibold">
                Improve
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Use your patterns and insights to make better study decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 px-6 py-20 text-center text-white">
        <CheckCircle2 className="mx-auto mb-5" size={36} />

        <h2 className="text-3xl font-bold">
          Ready to understand your study habits?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-gray-300">
          Start tracking your sessions and turn your study behaviour into
          meaningful insights.
        </p>

        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-gray-800 transition hover:bg-gray-200"
        >
          Create Your Account
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}