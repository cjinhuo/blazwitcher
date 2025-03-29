'use client'

import type React from 'react'
import './chrome.css'

interface ChromeFrameworkProps {
	children: React.ReactNode
}

const ChromeFramework: React.FC<ChromeFrameworkProps> = ({ children }) => {
	return (
		<div className='chrome-browser rounded-lg overflow-hidden shadow-2xl border border-gray-300'>
			{/* Chrome browser header */}
			<div className='chrome-browser-header'>
				{/* Top control bar */}
				<div className='chrome-control-bar'>
					<div className='window-controls'>
						<span className='window-control close'></span>
						<span className='window-control minimize'></span>
						<span className='window-control maximize'></span>
					</div>
					<div className='browser-actions'>
						<button className='nav-button' type='button'>
							<svg viewBox='0 0 24 24' className='w-4 h-4'>
								<title id='backButtonTitle'>Back</title>
								<path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' fill='currentColor' />
							</svg>
						</button>
						<button className='nav-button' type='button'>
							<svg className='w-4 h-4' viewBox='0 0 24 24' stroke='currentColor'>
								<title>Forward</title>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M10.59 6L12 7.41 16.17 12 12 16.59 10.59 18l6-6z'
								/>
							</svg>
						</button>
						<button className='nav-button' type='button'>
							<svg viewBox='0 0 24 24' className='w-4 h-4'>
								<title id='refreshButtonTitle'>Refresh</title>
								<path
									d='M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
									fill='currentColor'
								/>
							</svg>
						</button>
						<button className='nav-button' aria-label='Home' type='button'>
							<svg viewBox='0 0 24 24' className='w-4 h-4' aria-labelledby='homeButtonTitle'>
								<title id='homeButtonTitle'>Home</title>
								<path d='M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' fill='currentColor' />
							</svg>
						</button>
					</div>
				</div>

				{/* Tab section - only show Google tab */}
				<div className='chrome-tabs'>
					<div className='tab active'>
						<div className='tab-content'>
							<span className='tab-favicon google-favicon'></span>
							<span className='tab-title'>Google</span>
							<span className='tab-close'>×</span>
						</div>
					</div>
					<div className='new-tab-button'>+</div>
				</div>

				{/* Address bar - shows Google.com */}
				<div className='chrome-address-bar'>
					<div className='address-bar-container'>
						<div className='security-indicator'>
							<svg viewBox='0 0 24 24' className='w-4 h-4'>
								<title id='menuButtonTitle'>More options</title>
								<path
									d='M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z'
									fill='currentColor'
								/>
							</svg>
						</div>
						<div className='site-info'>www.google.com</div>
						<div className='address-bar-actions'>
							<button className='address-action-button' type='button'>
								<svg viewBox='0 0 24 24' className='w-4 h-4'>
									<title id='menuButtonTitle'>More options</title>
									<path
										d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z'
										fill='currentColor'
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Content area */}
			<div className='chrome-content'>{children}</div>
		</div>
	)
}

export default ChromeFramework
