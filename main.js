// 获取页面元素
const animeListContainer = document.getElementById('anime-list');
const animeDetailContainer = document.getElementById('anime-detail');
const yearTabs = document.getElementById('years');
const seasonTabs = document.getElementById('seasons');
const detailTitle = document.getElementById('detail-title');
const detailIcon = document.getElementById('detail-icon');
const detailDesc = document.getElementById('detail-desc');
const detailTags = document.getElementById('detail-tags');
const detailInfoContainer = document.getElementById('detail-info-container');

// 各年份的季节动画 JSON 文件列表
const seasonAnimeFiles = {
  "2024": {
    winter: [],
    spring: [],
    summer: [],
    autumn: []
  },
  "2025": {
    winter: [],
    spring: ["黑执事 绿魔女篇", "前桥魔女"],
    summer: [],
    autumn: []
  }
};

// 字段显示名称映射
const fieldLabels = {
  "首播日": "首播日",
  "集数": "集数",
  "动画制作": "动画制作",
  "原作": "原作",
  "音乐制作": "音乐制作",
  "日本放送局": "日本放送局",
  "广告代理": "广告代理",
  "海外授权": "海外授权",
  "日本流媒体授权": "日本流媒体授权",
  "日本流媒体": "日本流媒体",
  "碟片": "碟片",
  "音乐·OP": "音乐·OP",
  "音乐·ED": "音乐·ED",
  "音乐·OST": "音乐·OST",
  "日本商品授权": "日本商品授权",
  "宣传": "宣传"
};

// 加载指定年份和季节的所有动画 JSON
function loadSeason(year, season) {
  // 清空当前列表内容
  animeListContainer.innerHTML = "";

  // 获取该季节对应的文件名列表
  const files = seasonAnimeFiles[year]?.[season] || [];
  if (files.length === 0) {
    animeListContainer.textContent = "暂无该季节的动画数据。";
    return;
  }

  // 异步加载所有 JSON 文件
  Promise.all(
    files.map(file => {
      // 使用 encodeURIComponent 处理中文文件名
      const encodedFile = encodeURIComponent(file);
      return fetch(`data/${year}/${season}/${encodedFile}.json`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`无法加载文件: ${file}.json`);
          }
          return res.json();
        });
    })
  ).then(animeList => {
    // 遍历每个动画的数据对象，创建对应的卡片元素
    animeList.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';

      // 动画图标
      const iconEl = document.createElement('div');
      iconEl.className = 'anime-icon ' + anime.icon;
      card.appendChild(iconEl);

      // 动画标题
      const titleEl = document.createElement('h3');
      titleEl.className = 'anime-title';
      titleEl.textContent = anime.title;
      card.appendChild(titleEl);

      // 点击卡片显示详情
      card.addEventListener('click', () => {
        showDetail(anime);
      });

      // 将卡片添加到列表容器中
      animeListContainer.appendChild(card);
    });
  }).catch(error => {
    console.error("加载动画数据失败:", error);
    animeListContainer.innerHTML = `<div class="error-message">加载数据失败: ${error.message}</div>`;
  });
}

// 显示动画详情信息
function showDetail(anime) {
  // 填充基本信息
  detailTitle.textContent = anime.title;
  detailIcon.className = 'detail-icon ' + anime.icon;
  detailDesc.textContent = anime.description || "";

  // 填充标签列表
  detailTags.innerHTML = "";
  if (anime.tags && Array.isArray(anime.tags)) {
    anime.tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag';
      tagSpan.textContent = tag;
      detailTags.appendChild(tagSpan);
    });
  }

  // 清空之前的详情信息
  detailInfoContainer.innerHTML = "";
  
  // 动态生成详情字段
  const fieldOrder = [
    "首播日", "集数", "动画制作", "原作", "日本放送局","广告代理","海外授权","日本流媒体授权","日本流媒体","碟片",
    "音乐制作","音乐·OP","音乐·ED","音乐·OST","日本商品授权","宣传"
  ];
  
  fieldOrder.forEach(field => {
    if (anime[field] !== undefined && anime[field] !== null && anime[field] !== "") {
      const p = document.createElement('p');
      p.innerHTML = `<span>${fieldLabels[field] || field}:</span> ${anime[field]}`;
      detailInfoContainer.appendChild(p);
    }
  });

  // 显示详情容器，隐藏列表容器
  animeListContainer.style.display = 'none';
  animeDetailContainer.style.display = 'block';
}

// 年份按钮事件
yearTabs.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', function() {
    // 更新年份激活状态
    document.querySelector('#years button.active')?.classList.remove('active');
    this.classList.add('active');
    
    const year = this.getAttribute('data-year');
    
    // 显示季节选择器
    seasonTabs.style.display = 'flex';
    
    // 激活第一个季节
    const firstSeasonBtn = seasonTabs.querySelector('button');
    seasonTabs.querySelector('.active')?.classList.remove('active');
    firstSeasonBtn.classList.add('active');
    
    // 加载季节数据
    loadSeason(year, firstSeasonBtn.getAttribute('data-season'));
  });
});

// 季节按钮事件
seasonTabs.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', function() {
    // 更新季节激活状态
    seasonTabs.querySelector('.active')?.classList.remove('active');
    this.classList.add('active');
    
    // 加载季节数据
    const year = document.querySelector('#years button.active').getAttribute('data-year');
    const season = this.getAttribute('data-season');
    loadSeason(year, season);
    
    // 确保列表可见
    animeDetailContainer.style.display = 'none';
    animeListContainer.style.display = 'grid';
  });
});

// 关闭详情按钮
document.getElementById('close-detail').addEventListener('click', () => {
  animeDetailContainer.style.display = 'none';
  animeListContainer.style.display = 'grid';
});

// 默认加载2025年春季数据
loadSeason('2025', 'spring');