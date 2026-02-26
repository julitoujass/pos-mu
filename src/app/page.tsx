
import LoginForm from '@/components/auth/login-form'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-light/10 rounded-full blur-3xl translate-y-1/2"></div>
      </div>

      <div className="z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">

        {/* Text Setup */}
        <div className="text-center md:text-left max-w-lg">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-brand uppercase bg-brand/10 rounded-full">
            Sistema POS Profesional
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
            Mundo <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">Uniforme</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Optimiza tu negocio con nuestra plataforma integral. Control total sobre inventario y ventas con una interfaz diseñada para ti.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-medium">
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white font-bold text-2xl">100%</span>
              <span className="text-brand text-xs uppercase tracking-wide">Control</span>
            </div>
            <div className="w-px h-10 bg-gray-200 dark:bg-gray-800"></div>
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white font-bold text-2xl">24/7</span>
              <span className="text-brand text-xs uppercase tracking-wide">Acceso</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />

      </div>
    </main>
  )
}
