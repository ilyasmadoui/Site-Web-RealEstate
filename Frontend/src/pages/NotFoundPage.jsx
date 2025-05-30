import React from 'react'
import '../styles/PageNotFound.scss';

function NotFoundPage() {
  return (
    <div className='NotFound-container'>
      <p className='ErrorMessage'>❌ 404</p>
      <p className='ErrorContent'>Oops! The page you're looking for doesn't exist.</p>
    </div>
  )
}

export default NotFoundPage