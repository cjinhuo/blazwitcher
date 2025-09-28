// 测试节流功能
const testThrottle = async () => {
	const baseURL = 'http://localhost:3000'
	const testData = {
		data: {
			windowId: 123456,
			ungroupedTabs: [
				{
					itemType: 'tab',
					data: {
						id: 1,
						title: 'Test Tab 1',
						url: 'https://example.com',
						host: 'example.com',
					},
				},
			],
			existingGroups: [],
			summary: {
				totalTabs: 1,
				ungroupedTabs: 1,
				existingGroupsCount: 0,
			},
		},
	}

	console.log('🧪 开始测试节流功能...')
	console.log('📝 测试场景：连续发送多个请求，验证节流是否生效')
	console.log('⏰ 预期结果：第一个请求成功，后续请求被节流（429状态码）')
	console.log('')

	// 发送第一个请求（应该成功）
	console.log('🚀 发送第1个请求...')
	try {
		const response1 = await fetch(`${baseURL}/ark/categorize-tabs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(testData),
		})

		console.log(`📊 第1个请求状态: ${response1.status}`)
		if (response1.status === 200) {
			console.log('✅ 第1个请求成功（符合预期）')
		} else if (response1.status === 429) {
			console.log('⚠️  第1个请求被节流（可能之前有请求记录）')
		} else {
			console.log(`❌ 第1个请求异常: ${response1.status}`)
		}
	} catch (error) {
		console.error('❌ 第1个请求失败:', error.message)
	}

	// 等待1秒后发送第二个请求（应该被节流）
	console.log('')
	console.log('⏳ 等待1秒...')
	await new Promise((resolve) => setTimeout(resolve, 1000))

	console.log('🚀 发送第2个请求...')
	try {
		const response2 = await fetch(`${baseURL}/ark/categorize-tabs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(testData),
		})

		console.log(`📊 第2个请求状态: ${response2.status}`)
		if (response2.status === 429) {
			console.log('✅ 第2个请求被节流（符合预期）')
			const errorText = await response2.text()
			console.log('📄 节流响应内容:', errorText)
		} else if (response2.status === 200) {
			console.log('⚠️  第2个请求成功（节流可能未生效）')
		} else {
			console.log(`❌ 第2个请求异常: ${response2.status}`)
		}
	} catch (error) {
		console.error('❌ 第2个请求失败:', error.message)
	}

	// 等待1秒后发送第三个请求（应该被节流）
	console.log('')
	console.log('⏳ 等待1秒...')
	await new Promise((resolve) => setTimeout(resolve, 1000))

	console.log('🚀 发送第3个请求...')
	try {
		const response3 = await fetch(`${baseURL}/ark/categorize-tabs`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(testData),
		})

		console.log(`📊 第3个请求状态: ${response3.status}`)
		if (response3.status === 429) {
			console.log('✅ 第3个请求被节流（符合预期）')
		} else if (response3.status === 200) {
			console.log('⚠️  第3个请求成功（节流可能未生效）')
		} else {
			console.log(`❌ 第3个请求异常: ${response3.status}`)
		}
	} catch (error) {
		console.error('❌ 第3个请求失败:', error.message)
	}

	console.log('')
	console.log('🏁 节流测试完成')
	console.log('')
	console.log('📋 测试总结：')
	console.log('- 如果看到多个 429 状态码，说明节流功能正常工作')
	console.log('- 如果看到多个 200 状态码，说明节流功能可能未生效')
	console.log('- 节流配置：每小时1次请求（ttl: 60 * 60 * 1000, limit: 1）')
}

// 运行测试
testThrottle().catch(console.error)
