
import Image from "next/image";
import PythonInterpreter from "./PythonInterpreter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 font-sans">
      {/* Navigation Bar */}
      <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-zinc-900/80 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Image src="/file.svg" alt="Logo" width={32} height={32} />
          <span className="text-xl font-bold tracking-tight text-blue-700 dark:text-blue-300">AI & ML Academy</span>
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <a href="#courses" className="hover:text-blue-600 transition-colors">Courses</a>
          <a href="#interpreter" className="hover:text-blue-600 transition-colors">Python Lab</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center bg-gradient-to-b from-blue-100/40 to-transparent dark:from-blue-950/30">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-zinc-900 dark:text-white drop-shadow-lg">Learn AI & Machine Learning<br className="hidden sm:block" /> with Python</h1>
        <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-200 max-w-2xl mb-8">Master the fundamentals of Artificial Intelligence and Machine Learning with hands-on Python labs, interactive lessons, and real-world projects. No prior experience required!</p>
        <a href="#courses" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors text-lg">Start Learning</a>
      </header>

      {/* Courses Section (Filler) */}
      <section id="courses" className="py-16 px-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-zinc-900 dark:text-white">Our Courses</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 shadow flex flex-col items-start">
            <h3 className="font-semibold text-lg mb-2">Introduction to AI</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">(Filler) Learn the basics of Artificial Intelligence, its history, and real-world applications. Coming soon!</p>
            <span className="inline-block bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded text-xs">Beginner</span>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 shadow flex flex-col items-start">
            <h3 className="font-semibold text-lg mb-2">Machine Learning with Python</h3>
            <p className="text-zinc-700 dark:text-zinc-300 mb-4">(Filler) Dive into supervised and unsupervised learning, model evaluation, and hands-on Python coding. Coming soon!</p>
            <span className="inline-block bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded text-xs">Intermediate</span>
          </div>
        </div>
      </section>

      {/* Python Interpreter Section */}
      <section id="interpreter" className="py-16 px-4 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-zinc-900 dark:text-white">Try Python in Your Browser</h2>
        <PythonInterpreter />
      </section>

      {/* About Section */}
      <section id="about" className="py-12 px-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-zinc-900 dark:text-white">About AI & ML Academy</h2>
          <p className="text-zinc-700 dark:text-zinc-300 mb-2">(Filler) AI & ML Academy is dedicated to making artificial intelligence and machine learning accessible to everyone. Our interactive platform combines engaging lessons, hands-on coding, and real-world projects to help you learn effectively and efficiently.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-zinc-500 dark:text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        &copy; {new Date().getFullYear()} AI & ML Academy. All rights reserved.
      </footer>
    </div>
  );
}
