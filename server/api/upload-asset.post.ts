import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
  // 1. 从 runtimeConfig 获取服务器端的安全密钥
  //    这在 nuxt.config.ts 中配置
  const config = useRuntimeConfig(event)
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  })

  // 2. 读取上传的文件数据
  const multipartFormData = await readMultipartFormData(event)
  const file = multipartFormData?.[0]

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: '未找到文件。' })
  }

  // 3. 将文件 Buffer 转换为 Cloudinary SDK V2 需要的 Data URI
  const fileType = file.type || 'application/octet-stream'
  const base64Data = file.data.toString('base64')
  const dataUri = `data:${fileType};base64,${base64Data}`

  try {
    // 4. 上传到 Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'auto', // 自动检测资源类型 (image, video, raw)
      folder: 'supermap_notes', // 在 Cloudinary 中自动创建此文件夹
    })

    // 5. 仅返回安全 URL
    return {
      url: result.secure_url,
    }
  } catch (error: any) {
    console.error('Cloudinary 上传失败:', error)
    throw createError({ statusCode: 500, statusMessage: `上传失败: ${error.message}` })
  }
})