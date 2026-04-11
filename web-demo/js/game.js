// 游戏核心数据
let gameData = {
  time: "6:30", stamina: 100, fear: 0, trust: 50
};

// ========== 关键修复：先定义DOM对象，再绑定BGM元素 ==========
// DOM元素（提前定义，解决未定义报错）
const dom = {
  time: document.getElementById("time"), stamina: document.getElementById("stamina"),
  fear: document.getElementById("fear"), trust: document.getElementById("trust"),
  charImg: document.getElementById("charImg"), char: document.querySelector(".vn-char"),
  charName: document.getElementById("charName"), text: document.getElementById("dialogText"),
  choice: document.getElementById("choiceBox"), quiz: document.getElementById("quizBox"),
  quizTitle: document.getElementById("quizTitle"), quizOptions: document.getElementById("quizOptions"),
  start: document.getElementById("startPanel"), autoBtn: document.getElementById("autoBtn"),
  speedSelect: document.getElementById("speedSelect"),
  // 先占位，后续赋值
  bgm: null,
  bgmBtn: document.getElementById("bgmBtn")
};

// ==================== 背景音乐（修复完整版） ====================
// 背景音乐配置
const bgmConfig = {
  tracks: {
    日常剧情: "assets/bgm/normal.mp3",
    紧张预警: "assets/bgm/warning.mp3",
    危险爆发: "assets/bgm/danger.mp3",
    安全结局: "assets/bgm/happy.mp3"
  },
  volume: 0.5,
  currentTrack: null,
  isPlaying: false // 新增：记录音乐播放状态，解决按钮文字不同步问题
};

// 播放指定BGM（核心修复：强制用户交互上下文，增加日志）
function playBGM(trackKey) {
  // 校验DOM和曲目存在性
  if (!dom.bgm) {
    console.error("BGM音频元素未找到！请检查HTML中id='bgm'的audio标签");
    return;
  }
  if (!bgmConfig.tracks[trackKey]) {
    console.error(`未找到${trackKey}对应的BGM文件，请检查bgmConfig.tracks配置`);
    return;
  }

  // 重复播放同一首不重置
  if (bgmConfig.currentTrack === trackKey && bgmConfig.isPlaying) return;

  bgmConfig.currentTrack = trackKey;
  dom.bgm.src = bgmConfig.tracks[trackKey];
  dom.bgm.volume = bgmConfig.volume;
  dom.bgm.loop = true; // 确保循环播放（显式声明）

  // 播放音乐（用户交互上下文内执行）
  dom.bgm.play()
    .then(() => {
      bgmConfig.isPlaying = true;
      dom.bgmBtn.innerText = "关闭音乐";
      console.log(`成功播放BGM：${trackKey}`);
    })
    .catch(err => {
      console.error("BGM播放失败：", err);
      alert("音乐播放失败！请检查：1.音频文件路径是否正确 2.是否在浏览器中点击过页面（需用户交互）");
    });
}

// 暂停音乐（不重置进度）
function pauseBGM() {
  if (!dom.bgm) return;
  dom.bgm.pause();
  bgmConfig.isPlaying = false;
  dom.bgmBtn.innerText = "开启音乐";
}

// 停止音乐（重置进度）
function stopBGM() {
  if (!dom.bgm) return;
  dom.bgm.pause();
  dom.bgm.currentTime = 0;
  bgmConfig.currentTrack = null;
  bgmConfig.isPlaying = false;
  dom.bgmBtn.innerText = "开启音乐";
}

// 【核心修复】单按钮切换播放/暂停（彻底解决状态不同步）
function toggleBGM() {
  if (!dom.bgm) {
    alert("音频组件未加载！");
    return;
  }

  if (bgmConfig.isPlaying) {
    // 播放中 → 暂停
    pauseBGM();
  } else {
    // 暂停/未播放 → 播放
    if (bgmConfig.currentTrack) {
      // 有历史曲目，继续播放
      dom.bgm.play()
        .then(() => {
          bgmConfig.isPlaying = true;
          dom.bgmBtn.innerText = "关闭音乐";
        })
        .catch(err => {
          console.error("恢复播放失败：", err);
          // 回退到默认曲目
          playBGM("日常剧情");
        });
    } else {
      // 无历史曲目，播放默认
      playBGM("日常剧情");
    }
  }
}



// 新增：背景图片路径映射（请替换为你的实际图片路径）
const bgImages = {
  初始场景: "assets/bg/bg1.png",   // 起床/屋内场景
  出发路上: "assets/bg/bg2.png",   // 村口集合/出发
  泥石流预警: "assets/bg/bg3.png", // 发现小股泥石流
  泥石流爆发: "assets/bg/bg4.png", // 泥石流大规模爆发
  安全脱险: "assets/bg/bg5.png"    // 脱险后/安全地带
};

// 自动播放配置
let autoPlay = {
  enable: false,
  speed: 2,
  waitTime: [2000, 1200, 600],
  timer: null
};

// 新增：渐变切换背景图片函数
function changeBackground(bgKey) {
  const bgImgEl = document.getElementById("bgImage");
  const targetImg = bgImages[bgKey];
  
  // 先加载图片，避免切换时白屏
  const tempImg = new Image();
  tempImg.src = targetImg;

  tempImg.onload = () => {
    // 先隐藏当前背景（触发渐变）
    bgImgEl.style.opacity = 0;
    // 等待过渡结束后替换图片，再显示
    setTimeout(() => {
      bgImgEl.style.backgroundImage = `url('${targetImg}')`;
      // 强制重绘，确保过渡生效
      void bgImgEl.offsetWidth;
      bgImgEl.style.opacity = 1;
    }, 1000); // 与CSS过渡时长一致
  };

  // 图片加载失败容错
  tempImg.onerror = () => {
    console.error(`背景图片加载失败：${targetImg}`);
    bgImgEl.style.backgroundImage = `url('${targetImg}')`;
    bgImgEl.style.opacity = 1;
  };
}

// 新增：隐藏背景（可选，如游戏结束时）
function hideBackground() {
  const bgImgEl = document.getElementById("bgImage");
  bgImgEl.style.opacity = 0;
  setTimeout(() => {
    bgImgEl.style.backgroundImage = "none";
  }, 1000);
}

// 角色立绘映射
const charData = {
  外婆: { img: "assets/profile/gra1.png" },
  妈妈: { img: "assets/profile/mom.png" },
  苏伯伯: { img: "assets/profile/su.png" },
  何老师: { img: "assets/profile/helaoshi.png" },
  何哥哥: { img: "assets/profile/hegege.png" },
  村民1: { img: "assets/profile/cunmin1.png" },
  村民2: { img: "assets/profile/cunmin2.png" },
  村民3: { img: "assets/profile/cunmin1.png" },
};

// 核心控制变量（修复首句BUG）
let isTextDone = false;     // 文字是否打印完成
let nextFunc = null;        // 下一段剧情函数
let hasChoice = false;      // 是否有选项
let isPrinting = false;     // 是否正在逐字打印
let printTimer = null;      // 逐字打印定时器
let currentText = "";       // 当前要打印的完整文字

// ==================== 核心功能 ====================
// 更新状态栏
function updateStatus() {
  dom.time.innerText = gameData.time;
  dom.stamina.innerText = gameData.stamina + "%";
  dom.fear.innerText = gameData.fear + "%";
  dom.trust.innerText = gameData.trust + "%";
}

// 清空选项
function clearChoice() {
  dom.choice.innerHTML = "";
  hasChoice = false;
}

// 添加选项
function addChoice(text, cb) {
  hasChoice = true;
  let btn = document.createElement("button");
  btn.innerText = text;
  btn.onclick = (e) => {
    e.stopPropagation();
    clearChoice();
    stopAutoTimer();
    cb();
  };
  dom.choice.appendChild(btn);
}



// 显示/隐藏立绘
function showChar(name) {
  if (!name || !charData[name]) {
    dom.char.classList.remove("show");
    dom.charName.classList.remove("show");
    return;
  }
  dom.charImg.src = charData[name].img;
  dom.charName.innerText = name;
  dom.char.classList.add("show");
  dom.charName.classList.add("show");
}

// 停止所有定时器
function stopAllTimer() {
  if (autoPlay.timer) clearTimeout(autoPlay.timer);
  if (printTimer) clearInterval(printTimer);
}

// 停止自动计时器
function stopAutoTimer() {
  if (autoPlay.timer) clearTimeout(autoPlay.timer);
}

// 切换自动/手动
function toggleAuto() {
  autoPlay.enable = !autoPlay.enable;
  dom.autoBtn.innerText = autoPlay.enable ? "自动模式" : "手动模式";
  if (autoPlay.enable && isTextDone && nextFunc && !hasChoice) {
    autoNext();
  }
}

// 改变倍速
function changeSpeed() {
  autoPlay.speed = parseInt(dom.speedSelect.value);
}

// 自动推进
function autoNext() {
  stopAutoTimer();
  if (!autoPlay.enable || !isTextDone || !nextFunc || hasChoice) return;
  autoPlay.timer = setTimeout(() => {
    nextFunc();
  }, autoPlay.waitTime[autoPlay.speed - 1]);
}

// 立即显示全部文字
function showFullText() {
  if (!isPrinting) return;
  clearInterval(printTimer);
  dom.text.innerText = currentText;
  isTextDone = true;
  isPrinting = false;
  if (autoPlay.enable && !hasChoice) autoNext();
}

// 全局点击逻辑（完美修复）
document.addEventListener("click", (e) => {
  // 👇 核心修复：只要在开始面板里，直接放行，不执行任何全局逻辑
    if (e.target.closest("#startPanel") || e.target.closest(".diary-box")) {
        return;
    }
  if (e.target.closest('.vn-control')) return;
  if (hasChoice) return;
  
  // 文字打印中 → 显示全部
  if (isPrinting) {
    showFullText();
    return;
  }
  
  // 文字完成 → 推进剧情
  if (!autoPlay.enable && isTextDone && nextFunc) {
    stopAutoTimer();
    nextFunc();
  }
});

// 逐字打印文字（修复首句直接全显）
async function printText(text, speed = 30) {
  stopAllTimer();
  currentText = text;
  isTextDone = false;
  isPrinting = true;
  dom.text.innerText = "";
  let i = 0;
  
  return new Promise(resolve => {
    printTimer = setInterval(() => {
      dom.text.innerText += text[i++];
      if (i >= text.length) {
        clearInterval(printTimer);
        isTextDone = true;
        isPrinting = false;
        resolve();
        if (autoPlay.enable && !hasChoice) autoNext();
      }
    }, speed);
  });
}

// 显示系统消息
async function sysMsg(text, nextFn) {
  nextFunc = nextFn;
  showChar("");
  await printText(text);
}

// 显示角色对话
async function say(role, text, nextFn) {
  nextFunc = nextFn;
  showChar(role);
  await printText(`${role}：${text}`);
}

// 显示答题
async function showQuiz(title, options, correct, next) {
  stopAllTimer();
  hasChoice = true;
  dom.quizTitle.innerText = title;
  let html = "";
  options.forEach(o => {
    html += `<label><input type="radio" name="q" value="${o.val}"> ${o.val}. ${o.text}</label><br>`;
  });
  dom.quizOptions.innerHTML = html;
  dom.quiz.classList.add("show");
  window.submitQuiz = () => {
    let ans = document.querySelector('input[name="q"]:checked');
    if (!ans) return alert("请选择答案");
    dom.quiz.classList.remove("show");
    hasChoice = false;
    sysMsg(ans.value === correct ? "✅ 回答正确！" : "❌ 答案错误", next);
  };
}

// ==================== 新增：重新游玩功能 ====================
function resetGame() {
  // 停止所有定时器
  stopAllTimer();
  stopBGM(); // 重置时停音乐
  // 重置游戏数据
  gameData = { time: "6:30", stamina: 100, fear: 0, trust: 50 };
  autoPlay.enable = false;
  autoPlay.speed = 2;
  dom.autoBtn.innerText = "手动模式";
  dom.speedSelect.value = 2;
  
  // 重置控制变量
  isTextDone = false;
  nextFunc = null;
  hasChoice = false;
  isPrinting = false;
  currentText = "";
  
  // 重置DOM界面
  dom.text.innerText = "";
  clearChoice();
  showChar("");
  dom.quiz.classList.remove("show");
  updateStatus();
  
  // 返回开始界面
  dom.start.style.display = "flex";
}

// ==================== 完整剧情流程 ====================
async function startGame() {
  dom.start.style.display = "none";
  updateStatus();
  // 切换到初始场景背景
  changeBackground("初始场景");
  playBGM("日常剧情"); // 日常音乐
  // 修复首句逐字打印，强制等待执行
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await sysMsg("我揉了揉惺忪的睡眼，从床上爬起来，拉开窗帘，外面全是灰蒙蒙的。打开窗户，空气中有厚重的泥土味。", async ()=>{
    await say("外婆", "幺儿，快起来了。今天的路怕是不好走，咱们得早点准备了，到时候好跟着村里的大部队出发。", async ()=>{
      await sysMsg("外婆一边摆早饭，一边看着窗外紧锁眉头。我吃完饭收拾好物品，准备集合。", async ()=>{
        gameData.time = "8:00"; gameData.fear +=5; updateStatus();
         // 切换到「出发路上」背景
        changeBackground("出发路上");
        await sysMsg("我要跟着村书记苏伯伯和小伙伴们从梅子坪村出发返校，过了村子就能坐车去县城。", async ()=>{
          await say("妈妈", "这雨断断续续下了好几天了，今天的路可能很滑。你要跟着大部队慢慢走，小心一点。", async ()=>{
            await sysMsg("你如何看待脚下的路？", ()=>{
              addChoice("路虽烂，但没下雨，很快能到", async () => {
                await sysMsg("忽略了土壤水分饱和隐患，触发预警失效状态，信任值不变。", scene900);
              });
              addChoice("雨小但山不稳定，大人很担心", async () => {
                gameData.trust +=5; updateStatus();
                await sysMsg("你观察细致，信任值 +5%", scene900);
              });
            });
          });
        });
      });
    });
  });
}

async function scene900() {
  gameData.time = "9:00"; gameData.stamina -=15; gameData.fear +=10; updateStatus();
  // 切换到「泥石流预警」背景
  changeBackground("泥石流预警");
  playBGM("紧张预警"); // 紧张音乐
  await sysMsg("最前面的何哥哥一行人走得很快，已通过堵阿落谷地段。", async ()=>{
    await sysMsg("突然听到前面大人惊呼：泥石流了！", async ()=>{
      await say("村民1", "看，有一小股浑浊的稀泥巴从上游流下来了。", async ()=>{
        await say("小伙伴", "天呐，把我们要通过的路段覆盖住了。", async ()=>{
          await sysMsg("【知识】泥石流是山区沟谷由暴雨激发，含大量泥沙石块的混合流。", async ()=>{
            await showQuiz("下面哪个是泥石流？", [
              {val:"A",text:"水和泥土混合，比普通水流重，含大量泥石"},
              {val:"B",text:"山体岩土整体滑动"},{val:"C",text:"岩石突然倒塌"},{val:"D",text:"河道堵成水池"}
            ], "A", async () => {
              await showQuiz("泥石流诱发因素？", [
                {val:"A",text:"岩石风化、土壤松动"},{val:"B",text:"不合理开挖"},
                {val:"C",text:"修建防护林"},{val:"D",text:"地震+暴雨"},{val:"E",text:"修建水库"}
              ], "A", sceneAfterQuiz);
            });
          });
        });
      });
    });
  });
}

async function sceneAfterQuiz() {
  await sysMsg("面对小股泥石流，你会怎么做？", ()=>{
    addChoice("害怕，我要回家", async () => {
      gameData.fear +=10; gameData.trust -=5; updateStatus();
      await sysMsg("恐惧+10%，信任-5%，被长辈拦下安慰。", sceneSign);
    });
    addChoice("听苏伯伯指挥，他经验丰富", async () => {
      gameData.trust +=10; updateStatus();
      await sysMsg("信任+10%，应急知识派上用场了。", sceneSign);
    });
    addChoice("看起来不大，冲过去", async () => {
      await sysMsg("被苏伯伯厉声拦住：危险！不能硬冲！", sceneSign);
    });
  });
}

async function sceneSign() {
  await sysMsg("判断泥石流征兆：A河水断流 B夹草木 C深谷轰鸣 D道路倾斜 ✅ 全部正确", scene920);
}

async function scene920() {
  gameData.time = "9:20"; updateStatus();
  await say("苏伯伯", "不要走了，有泥石流！", async ()=>{
    await say("何老师", "大家往后退，别靠近沟口！", async ()=>{
      await sysMsg("众人迅速退至百米外安全地带。", async ()=>{
        await say("村民1", "现在能走吗？", async ()=>{
          await say("村民2", "不能让娃娃冒险，小泥浆后必有大泥石流！", async ()=>{
            await say("村民3", "赶不上开学咋办啊！", async ()=>{
              await say("苏伯伯", "安全第一！先观察，不行就绕道！", async ()=>{
                await sysMsg("大人们砍树枝准备搭桥，专人盯守水沟动态。", scene924);
              });
            });
          });
        });
      });
    });
  });
}

async function scene924() {
  gameData.time = "9:24"; updateStatus();
  await sysMsg("9:24-9:28 连续两次小泥石流，原定路线被完全淹没！", scene935);
}

async function scene935() {
  gameData.time = "9:35"; gameData.fear +=10; updateStatus();
  // 切换到「泥石流爆发」背景
  changeBackground("泥石流爆发");
  playBGM("危险爆发"); // 危险音乐
  await sysMsg("泥浆裹挟巨石呼啸而下，山谷发出巨响！", async ()=>{
    await say("何哥哥", "跑！跑！跑！", async ()=>{
      await sysMsg("立刻选择逃生方向！", ()=>{
        addChoice("往山上跑", async () => {
          await sysMsg("❌ 错误！山上易遇滚石滑坡！", sceneWait);
        });
        addChoice("往山下跑", async () => {
          await sysMsg("❌ 错误！泥石流速度远超人类！", sceneWait);
        });
        addChoice("向泥石流垂直方向跑", async () => {
          await sysMsg("✅ 正确！向两侧高坡快速撤离！", sceneWait);
        });
      });
    });
  });
}

async function sceneWait() {
  await sysMsg("大泥石流倾泻完毕，等待期间你选择？", ()=>{
    addChoice("抱怨饿了，催着出发", async () => {
      gameData.trust -=10; updateStatus();
      await sysMsg("信任-10%，大家觉得你不懂事。", scene1005);
    });
    addChoice("听从指挥，安静等待", async () => {
      gameData.trust +=10; updateStatus();
      await sysMsg("信任+10%，大家都很认可你。", scene1005);
    });
  });
}

async function scene1005() {
  gameData.time = "10:05"; gameData.fear -=20; updateStatus();
  // 切换到「安全脱险」背景
  changeBackground("安全脱险");
  playBGM("安全结局"); // 温馨结局音乐
  await sysMsg("苏伯伯统一指挥，泥石流过后形成稳固石路。", async ()=>{
    await say("苏伯伯", "小心脚下，快速通过！", async ()=>{
      await sysMsg("大人们接力护送孩子，全员安全脱险！恐惧-20%", endScene);
    });
  });
}

async function endScene() {
  showChar("");
  // 可选：游戏结束时隐藏背景
  hideBackground();
  await sysMsg("==================== 日记本 ====================", async ()=>{
    await sysMsg("反复的应急演练，让我们在危险面前沉着冷静。", async ()=>{
      await sysMsg("平时的科普知识，看似平常，却能在关键时刻守护生命。", async ()=>{
        await sysMsg("多一分准备，就多一分希望。", async ()=>{
          await sysMsg("==================== 游戏结束 ====================\n点击重新游玩按钮可再次体验");
        });
      });
    });
  });
}

// 页面加载完成后绑定所有事件（保险）
window.onload = function() {
  // 绑定开始按钮
  const startBtn = document.querySelector(".diary-box button");
  if (startBtn) startBtn.onclick = startGame;

  // 【关键修复】绑定音乐按钮（DOM加载完再绑）
  dom.bgm = document.getElementById("bgm");
  dom.bgmBtn = document.getElementById("bgmBtn");
  if (dom.bgmBtn) dom.bgmBtn.onclick = toggleBGM;
};

