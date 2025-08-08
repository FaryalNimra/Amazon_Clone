import React from 'react'

const AuthHero: React.FC = () => {
  return (
    <div className="hero-graphic">
      {/* Security Shield */}
      <div className="absolute top-10 left-10 w-16 h-16 border-2 border-primary-red rounded-full flex items-center justify-center opacity-30 animate-float">
        <svg className="w-8 h-8 text-primary-red" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
      </div>
      
      {/* Lock Icon */}
      <div className="absolute top-32 right-16 w-12 h-12 border-2 border-primary-red rounded-lg flex items-center justify-center opacity-25 animate-float" style={{ animationDelay: '1s' }}>
        <svg className="w-6 h-6 text-primary-red" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      
      {/* Key Icon */}
      <div className="absolute bottom-20 left-20 w-10 h-10 border-2 border-primary-red rounded-full flex items-center justify-center opacity-30 animate-float" style={{ animationDelay: '2s' }}>
        <svg className="w-5 h-5 text-primary-red" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
      </div>
      
      {/* Floating Circles */}
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary-red rounded-full opacity-40 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-blush-pink rounded-full opacity-30 animate-float" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-primary-red rounded-full opacity-35 animate-float" style={{ animationDelay: '2.5s' }}></div>
      
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 600">
        <line x1="50" y1="100" x2="350" y2="150" stroke="#E53935" strokeWidth="1"/>
        <line x1="300" y1="200" x2="100" y2="400" stroke="#E53935" strokeWidth="1"/>
        <line x1="150" y1="500" x2="250" y2="300" stroke="#E53935" strokeWidth="1"/>
      </svg>
      
      {/* Modern Geometric Shapes */}
      <div className="absolute top-1/2 left-1/4 w-8 h-8 border-2 border-primary-red transform rotate-45 opacity-20 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-blush-pink rounded-full opacity-25 animate-pulse-slow"></div>
    </div>
  )
}

export default AuthHero
