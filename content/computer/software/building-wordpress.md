---
title: "wordpress的搭建"
date: "2024-08-23 22:35:08"
tags:
  - software
---
# 前置

首先得租一个服务器，然后购买一个域名。

# 通过宝塔面板搭建wordpress

首先安装宝塔面板：[宝塔面板下载，免费全能的服务器运维软件](https://www.bt.cn/new/download.html)

安装完宝塔面板后，安装wordpress：[一键部署教程之wordpress部署 - Linux面板 - 宝塔面板论坛](https://www.bt.cn/bbs/thread-64368-1-1.html)

上面安装过程可能会遇到一些问题：[宝塔面板一键部署WordPress报错：数据库创建失败,请检查是否存在同名数据库!-CSDN博客](https://blog.csdn.net/aiains/article/details/139218173)

安装完wordpress后，首先要选择一款主题：[个人博客主题分享(WordPress) – Echo小窝](https://www.liveout.cn/31/)

我瞄了不同的主题后，目前选择了Angon：[Argon Theme Docs](https://argon-docs.solstice23.top/#/)

# 通过1panel面板搭建wordpress

步骤： [应用推荐｜通过1Panel应用商店安装WordPress_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1XfywYjELe/)

1panel 挺简洁的。

# wordpress个性化配置

1. 菜单栏配置，包含顶部导航菜单，左侧个人菜单等：[菜单](https://argon-docs.solstice23.top/#/menu)、 [左侧栏添加个性化图标 – ONE](https://www.ljqwx.top/archives/1419)
2. 顶部导航栏添加RSS。RSS的地址是 `${YOUR_SERVER}/feed/`
3. 文章要包含目录，我选择了Easy Table of Contents插件：[WordPress添加显示内容文章目录的两种方式 – 奶爸建站笔记](https://blog.naibabiji.com/files/wordpress-contents.html) 、[WordPress 如何加上文章目录列表（Easy Table of Contents 插件教程）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1AL4y1n7eB/)
4. 设置文章的固定连接。
每篇文章可以自定义url。
~~让URL更漂亮，更巴适些：[优化WordPress固定链接-CSDN博客](https://blog.csdn.net/qq_52475653/article/details/135027603) 、[WordPress设置/修改固定链接后文章页404错误解决 - 林风网络](https://www.linfengnet.com/wordpress/wordpress-skills/2749.html)~~
5. 添加归档。新建一个页面-->模板选择归档：[归档时间轴](https://argon-docs.solstice23.top/#/archives)
6. 和添加归档操作类似，添加留言板，说说页面。
7. 站点统计：
使用 google analysics ，安装 Site Kit by Google 插件。
google analysics 很好，但是它不能统计国内流量的访问情况。可以使用 “百度统计”
有个插件叫 “WPCode Lite”，可以在页面上插入统计代码，很好用。
~~不够好用：[WordPress统计分析插件 - WP Statistics - WordPress外贸建站专家](https://www.wppop.com/wp-statistics.html)~~
8. SEO
安装 Rank Math SEO 插件。它会生成sitemap，indexnow文件。
将sitemap 添加到google console 和 bing webmasters 中。（我测过了，现在无法将sitemap加入百度站点，不知道是因为必须要备案，还是必须要交钱。那就不加了）：[网站提交至Google、Bing和百度搜索引擎的完整指南 - 知乎](https://zhuanlan.zhihu.com/p/81652862330)
9. wordpress小工具还挺好的，可以在侧边栏添加内容：[WordPress小工具管理_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1vh411y73q/?vd_source=ea1e003da1d6dc8e1c2cff14189549ee)
10. 侧边栏添加标签云：[WordPress标签云Cool Tag Cloud标签云插件教程 | 晓得博客](https://www.pythonthree.com/wordpress-cool-tag-cloud-plugin-tutorial/)
11. 在页脚添加站点的运行时间，我找了一个js的代码放在页脚中，[WordPress网站底部添加网站已运行时间代码,多款样式代码 - WP站长圈](https://www.wpzzq.com/1050.html)。当然，如果想要更好看，可以参考：[博客Argon主题美化 – pidanxia’ s Blog](https://pidanxia.ink/beautify/) 、[Argon博客美化 – 小羊信号塔–励志成为全栈0.0](https://xiaoyang1227luliyyds.com/blog%E7%BE%8E%E5%8C%96/)
12. 了解下wordpress使用默认的Gutenberg编辑器：[新版WordPress编辑器古腾堡（Gutenberg）怎么用？- 详细教程 - WPorder](https://www.wporder.com/8372/)
13. ~~文章可以插入Creative Commons(CC)协议~~。
不~~是特别必要的插件~~。
~~关于CC协议的介绍：[CC版权协议是啥？免费素材避免踩坑，商用需要了解的版权知识! | 自由超](https://freechao.com/7067.html) 。我一般使用CC-BY协议，即转载修改等需要注明出处。需要安装下[Creative Commons 插件](https://wordpress.com/zh-cn/plugins/creative-commons) ，然后再Gutenberg块块中插入协议即可~~。
14. 开启SSL。
~~宝塔面板中Let’s Encrypt 不好用。默认会自动续签，[宝塔面板网站SSL证书到期如何手动和自动续签Let’s Encrypt-CRMEB社区](https://www.crmeb.com/ask/thread/39610) 。宝塔的自动续签功能有点bug，修复方法可见：[修复宝塔面板9.0.0无法自动续签Let‘sEncrypt证书-CSDN博客](https://blog.csdn.net/Hugh_W/article/details/146249310) 。当然，也有些wordpress插件提供类似的功能，但不如上面这个方便，这些插件的使用见，[WordPress免费 Let’s Encrypt SSL 证书插件-WP Encryption SSL-魏艾斯笔记](https://www.vpsss.net/28850.html)~~
把域名托管到 cloudflare 上。使用cloudflare 代理。站点本身，使用了 cloudflare 中创建的一个15年有效期的证书。（[详细图文手把手教你阿里云注册域名如何托管到CloudFlare DNS服务_cloud 托管阿里云购买的域名-CSDN博客](https://blog.csdn.net/dreamingsleeping/article/details/139745997)）
15. RSS 失效问题：测试了下，是因为，这些订阅不支持IPV6。给域名添加一个ipv4地址即可。

# wordpress的迁移

一定要在使用wordpress不久后，尝试整个站点的迁移。因为这时候，即使失败了，成本也很小。

有很多迁移插件：[2023 年最佳 WordPress 迁移插件](https://seahawkmedia.com/zh/wordpress/best-wordpress-migration-plugins/)

我最开始尝试的是 All-in-One 插件：[怎么迁移WordPress网站？ - 询盘自由网](https://www.xunpanziyou.com/articles/wordpress-migration) 。但是这个插件，导出的时候没问题，导入的时候，进度条卡住了。上网找了找，看到有很多人有这个现象。没办法，只好再找其他插件。

我接着尝试的是，[Getting Started - Duplicator](https://duplicator.com/knowledge-base-article-categories/quick-start/) 、[WordPress 迁移插件 Duplicator 新手快速网站搬家-魏艾斯笔记](https://www.vpsss.net/28583.html) 。只遇到一个小问题，便迁迁移成功了：[Local Install not validating database | WordPress.org](https://wordpress.org/support/topic/local-install-not-validating-database/) 。迁移成功过后，我遇到404无法访问，是因为这个：[WordPress设置/修改固定链接后文章页404错误解决 - 林风网络](https://www.linfengnet.com/wordpress/wordpress-skills/2749.html) 。Duplicator 自动备份的功能需要升级。

**现在我使用 UpdraftPlus**，感觉挺好：[WordPress 网站备份＋还原教程：使用 UpdraftPlus 自动备份到 Google 云盘，快乐没烦恼！_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV16M4y1c7m9/?vd_source=ea1e003da1d6dc8e1c2cff14189549ee)
