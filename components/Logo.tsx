import React from 'react'

const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-red rounded-lg flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
          </svg>
        </div>
        <div className="text-2xl font-bold text-primary-text">
          <span className="text-primary-red">Secure</span>Auth
        </div>
      </div>
    </div>
  )
}

export default Logo
