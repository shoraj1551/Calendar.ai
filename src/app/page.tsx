import { auth } from "@/auth";
import { LoginButton, DashboardButton, LogoutButton, HeaderSignInButton } from "@/components/home/auth-buttons";
import { ShieldCheck, Layers, Sparkles } from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">

      {/* Navigation / Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
        <div className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100">
          Calendar.ai
        </div>
        <div>
          {session ? (
            <DashboardButton />
          ) : (
            <HeaderSignInButton />
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Available in Alpha
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Stop Managing Your Time. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Let AI Defend It.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            The first intelligent agent that unifies your schedule, blocks distractions, and creates action from chaos.
          </p>

          <div className="pt-8">
            {session ? <DashboardButton /> : <LoginButton />}
          </div>

        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">

            {/* Feature 1 */}
            <div className="flex flex-col items-start bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Unified Truth</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Work, personal, and side projects in one view. We handle the conflicts so you never double-book again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Focus Defense</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We proactively block deep work sessions and defend your lunch. Your time is your most valuable asset.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-start bg-white dark:bg-gray-950 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-4">
                <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Meeting Intelligence</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Record, transcribe, and extract action items automatically. Turn talk into walk without lifting a finger.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-12 text-center text-sm text-gray-500">
        <p>&copy; 2024 Calendar.ai. Built for the future of work.</p>
      </footer>

    </div>
  );
}
