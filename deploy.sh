#!/bin/bash

# 豆瓣API部署脚本

echo "🎬 开始部署豆瓣API..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 测试API
echo "🧪 测试API功能..."
if node test_spider.js; then
    echo "✅ API测试通过"
else
    echo "❌ API测试失败"
    exit 1
fi

# 根据平台部署
case "${1}" in
    "vercel")
        echo "🚀 部署到 Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "📝 Vercel CLI 未安装，请运行: npm install -g vercel"
        fi
        ;;
    "netlify")
        echo "🌐 部署到 Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod
        else
            echo "📝 Netlify CLI 未安装，请运行: npm install -g netlify-cli"
        fi
        ;;
    "cloudflare")
        echo "☁️ 部署到 Cloudflare..."
        if command -v wrangler &> /dev/null; then
            wrangler deploy
        else
            echo "📝 Wrangler CLI 未安装，请运行: npm install -g wrangler"
        fi
        ;;
    *)
        echo "📋 使用说明:"
        echo "  ./deploy.sh vercel     - 部署到 Vercel"
        echo "  ./deploy.sh netlify    - 部署到 Netlify"
        echo "  ./deploy.sh cloudflare - 部署到 Cloudflare"
        echo ""
        echo "💡 推荐使用 Vercel: ./deploy.sh vercel"
        ;;
esac

echo "🎉 部署完成！"