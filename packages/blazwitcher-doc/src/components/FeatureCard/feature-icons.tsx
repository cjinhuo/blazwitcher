'use client'

import type React from 'react'

interface IconProps {
	className?: string
}

export const IconSearch: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'searchIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Search</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
			/>
		</svg>
	)
}

export const IconTag: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'tagIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Tag</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
			/>
		</svg>
	)
}

export const IconClock: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'clockIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Clock</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
			/>
		</svg>
	)
}

export const IconBookmark: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'bookmarkIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Bookmark</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
			/>
		</svg>
	)
}

export const IconSettings: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'settingsIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Settings</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
			/>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
		</svg>
	)
}

export const IconKeyboard: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'keyboardIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Keyboard</title>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16m-7 6h7' />
		</svg>
	)
}

export const IconChevronRight: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'chevronRightIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Chevron Right</title>
			<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
		</svg>
	)
}

export const IconGlobe: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'globeIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Globe</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9'
			/>
		</svg>
	)
}

// 数据来源图标
export const IconDatabase: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
	const titleId = 'databaseIconTitle'
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			fill='none'
			viewBox='0 0 24 24'
			stroke='currentColor'
			aria-labelledby={titleId}
		>
			<title id={titleId}>Database</title>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth={2}
				d='M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4'
			/>
		</svg>
	)
}
