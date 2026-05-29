export const HowItWorks = () => {
  const steps = [
    {
      icon: '🔍',
      title: 'Find Your Track',
      description: 'Browse hundreds of motocross tracks. Filter by location, difficulty, and available equipment.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: '📅',
      title: 'Book Online',
      description: 'Reserve your spot in seconds with our easy booking system. Instant confirmation.',
      color: 'from-red-500 to-orange-600',
    },
    {
      icon: '🏍️',
      title: 'Ride!',
      description: 'Show up with your booking code and own the track. Pure adrenaline awaits.',
      color: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            How It{' '}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Three simple steps to start your motocross adventure
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-b from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center font-black text-white text-xl shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-6 text-4xl shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>

              {/* Decorative line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`} />
            </div>
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg mb-6">
            Ready to get started?
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700">
            <span className="text-gray-300 font-medium">✨ Free to join</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300 font-medium">🚀 Instant access</span>
          </div>
        </div>
      </div>
    </section>
  );
};
