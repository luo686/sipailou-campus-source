'use strict';

// Biographical entries adapted from the supplied university history document.
const alumniFields = [
  [
    "物理与基础科学",
    "Physics & Basic Sciences"
  ],
  [
    "航天与国防科技",
    "Aerospace & Defense"
  ],
  [
    "建筑、土木与交通",
    "Architecture & Civil Engineering"
  ],
  [
    "信息电子与计算机",
    "Electronics & Computing"
  ],
  [
    "材料、化工与环境",
    "Materials & Environment"
  ],
  [
    "医学与生物医学工程",
    "Medicine & Biomedical Engineering"
  ],
  [
    "教育与大学治理",
    "Education"
  ],
  [
    "人文社科与艺术",
    "Humanities & Arts"
  ],
  [
    "经济与工商界",
    "Economics & Business"
  ]
];

const alumniPeople = [
  {
    "id": "1",
    "name": "严济慈",
    "group": 0,
    "affiliation": "南京高师—东南大学毕业（第一号毕业证书）",
    "bio": "著名物理学家，中国科学院院士、副院长，中国科学技术大学校长，我国近代物理研究奠基者之一",
    "photo": "https://www.cas.cn/xzfc/202103/t20210303_4779309.shtml"
  },
  {
    "id": "2",
    "name": "吴有训",
    "group": 0,
    "affiliation": "中央大学教授、校长",
    "bio": "物理学家，中国科学院院士、副院长，X射线散射研究先驱，曾任中央大学校长、上海交大校长",
    "photo": "https://commons.wikimedia.org/wiki/File:%E5%90%B3%E6%9C%89%E8%A8%93%E9%99%A2%E5%A3%AB.jpg"
  },
  {
    "id": "3",
    "name": "赵忠尧",
    "group": 0,
    "affiliation": "中央大学物理系",
    "bio": "核物理学家，中国科学院院士，被尊为“中国核物理鼻祖”，主持建成我国第一台质子静电加速器",
    "photo": "https://commons.wikimedia.org/wiki/File:%E8%B6%99%E5%BF%A0%E5%A0%AF.jpg"
  },
  {
    "id": "4",
    "name": "吴健雄",
    "group": 0,
    "affiliation": "1934年毕业于中央大学物理系",
    "bio": "实验物理学家。她主持的钴-60 β衰变实验验证了弱相互作用中的宇称不守恒。四牌楼校区设有吴健雄纪念馆。",
    "source": "https://archives.seu.edu.cn/2022/0613/c817a411564/page.htm",
    "photo": "https://commons.wikimedia.org/wiki/File:Chien-Shiung_Wu_%281912-1997%29_in_1958.jpg"
  },
  {
    "id": "5",
    "name": "竺可桢",
    "group": 0,
    "affiliation": "南京高师—东南大学教授",
    "bio": "气象学、地理学一代宗师，中国科学院院士，浙江大学校长，创建我国新型地学系科",
    "photo": "https://commons.wikimedia.org/wiki/File:Zhu_Kezhen_01.jpg"
  },
  {
    "id": "6",
    "name": "秉志",
    "group": 0,
    "affiliation": "南京高师—东南大学生物系主任",
    "bio": "动物学创始人和奠基人，中国科学院院士，以玄武湖为天然实验室采集制作大量动植物标本",
    "photo": "http://casad.cas.cn/ysxx2022/ygys/200906/t20090624_1810288.html"
  },
  {
    "id": "7",
    "name": "叶企孙",
    "group": 0,
    "affiliation": "东南大学教授",
    "bio": "物理学家、物理教育家，中国科学院院士，曾任清华大学校务委员会主席",
    "photo": "https://commons.wikimedia.org/wiki/File:Ye_Qisun.jpg"
  },
  {
    "id": "8",
    "name": "胡刚复",
    "group": 0,
    "affiliation": "东南大学物理系主任",
    "bio": "近代物理学奠基人之一，培养出吴有训、严济慈、赵忠尧等多位院士",
    "photo": "https://commons.wikimedia.org/wiki/File:Hu_Gangfu.jpg"
  },
  {
    "id": "9",
    "name": "李四光",
    "group": 0,
    "affiliation": "中央大学代理校长、名誉教授",
    "bio": "地质学家，中国科学院院士，地质力学创立者",
    "photo": "https://commons.wikimedia.org/wiki/File:Li_Siguang.jpg"
  },
  {
    "id": "10",
    "name": "金善宝",
    "group": 0,
    "affiliation": "南京高师—东南大学时期学生",
    "bio": "农学家、小麦育种专家，中国科学院院士，南京农学院（今南京农业大学）院长"
  },
  {
    "id": "11",
    "name": "任新民",
    "group": 1,
    "affiliation": "1934年考入中央大学化工系",
    "bio": "航天技术与液体火箭发动机专家，中国科学院院士，获“两弹一星”功勋奖章。",
    "source": "https://www.seu.edu.cn/2017/0216/c17408a183811/page.htm",
    "photo": "https://commons.wikimedia.org/wiki/File:%E5%B9%B4%E8%BD%BB%E7%9A%84%E4%BB%BB%E6%96%B0%E6%B0%91.jpg"
  },
  {
    "id": "12",
    "name": "黄纬禄",
    "group": 1,
    "affiliation": "中央大学电机系1940届毕业",
    "bio": "“两弹一星”功勋奖章获得者，导弹与控制专家，中国科学院、工程院两院院士",
    "photo": "https://commons.wikimedia.org/wiki/File:%E5%B9%B4%E8%BD%BB%E7%9A%84%E9%BB%84%E7%BA%AC%E7%A6%84.jpg"
  },
  {
    "id": "13",
    "name": "陆元九",
    "group": 1,
    "affiliation": "中央大学航空工程系1941年毕业",
    "bio": "“七一勋章”获得者，两院院士，惯性导航与航天测控专家",
    "photo": "https://www.nju.edu.cn/info/3891/406761.htm"
  },
  {
    "id": "14",
    "name": "闵桂荣",
    "group": 1,
    "affiliation": "南京工学院毕业",
    "bio": "航天工程与卫星总体专家，中国科学院、工程院两院院士",
    "photo": "https://www.cae.cn/cae/html/main/colys/59652992.html"
  },
  {
    "id": "15",
    "name": "朱光亚",
    "group": 1,
    "affiliation": "1941年考入中央大学物理系（次年转学西南联大）",
    "bio": "“两弹一星”功勋奖章获得者，核物理学家，中国科学院院士，新中国核科技组织领导者之一",
    "photo": "https://casad.cas.cn/ysxx2022/ygys/200906/t20090624_1791954.html"
  },
  {
    "id": "16",
    "name": "冯绥安",
    "group": 1,
    "affiliation": "中央大学时期校友",
    "bio": "著名航天航空学家，“阿波罗”登月工程重要专家与领导者之一"
  },
  {
    "id": "17",
    "name": "杨廷宝",
    "group": 2,
    "affiliation": "中央大学—南京工学院建筑系教授、系主任",
    "bio": "建筑泰斗，中国科学院院士，设计作品逾百，代表作有南京中央体育场、中央医院、北京和平宾馆、清华大学图书馆扩建等",
    "photo": "https://seuaa.seu.edu.cn/2014/0630/c12785a20518/pagem.htm"
  },
  {
    "id": "18",
    "name": "童寯",
    "group": 2,
    "affiliation": "曾任中央大学、南京工学院建筑系教授",
    "bio": "建筑师、建筑史研究者和建筑教育家。四牌楼校区图书馆设有童寯画室，保存其家属捐赠的绘画作品。",
    "source": "https://www.seu.edu.cn/2016/1205/c154a177658/page.htm",
    "photo": "https://history.seu.edu.cn/2018/0404/c18669a212169/page.htm"
  },
  {
    "id": "19",
    "name": "刘敦桢",
    "group": 2,
    "affiliation": "中央大学—南京工学院建筑系教授",
    "bio": "建筑史泰斗，中国科学院院士，与梁思成并称中国建筑史研究奠基人",
    "photo": "https://seuaa.seu.edu.cn/2014/0630/c12785a20518/pagem.htm"
  },
  {
    "id": "20",
    "name": "茅以升",
    "group": 2,
    "affiliation": "南京高师工科主任",
    "bio": "桥梁工程鼻祖，中国科学院院士，主持钱塘江大桥等工程，曾任河海大学、北洋大学、北方交大等校校长",
    "photo": "https://commons.wikimedia.org/wiki/File:Mao_Yisheng.jpg"
  },
  {
    "id": "21",
    "name": "齐康",
    "group": 2,
    "affiliation": "东南大学教授",
    "bio": "建筑学家，中国科学院院士，南京大屠杀遇难同胞纪念馆等重要建筑设计者",
    "photo": "https://rsc.seu.edu.cn/2007/0710/c3623a35112/page.htm"
  },
  {
    "id": "22",
    "name": "钟训正",
    "group": 2,
    "affiliation": "东南大学教授",
    "bio": "建筑学家，中国工程院院士",
    "photo": "https://rsc.seu.edu.cn/2007/0710/c3623a35115/page.htm"
  },
  {
    "id": "23",
    "name": "程泰宁",
    "group": 2,
    "affiliation": "东南大学教授",
    "bio": "建筑设计专家，中国工程院院士",
    "photo": "https://www.cae.cn/cae/html/main/colys/37947305.html"
  },
  {
    "id": "24",
    "name": "王建国",
    "group": 2,
    "affiliation": "东南大学教授",
    "bio": "城市设计与建筑学家，中国工程院院士",
    "photo": "https://www.cae.cn/cae/html/main/colys/44039916.html"
  },
  {
    "id": "25",
    "name": "段进",
    "group": 2,
    "affiliation": "东南大学教授",
    "bio": "城市空间规划专家，中国科学院院士",
    "photo": "https://rcb.seu.edu.cn/2019/1202/c56275a509336/page.htm"
  },
  {
    "id": "26",
    "name": "吕志涛",
    "group": 2,
    "affiliation": "南京工学院—东南大学教授",
    "bio": "结构工程专家，中国工程院院士"
  },
  {
    "id": "27",
    "name": "黄卫",
    "group": 2,
    "affiliation": "1982年毕业于南京工学院，后任东南大学教授",
    "bio": "道路、桥梁及交通工程专家，中国工程院院士。",
    "source": "https://www.seu.edu.cn/28450/list.htm",
    "photo": "https://www.cae.cn/cae/html/main/colys/25475056.html"
  },
  {
    "id": "28",
    "name": "缪昌文",
    "group": 2,
    "affiliation": "南京工学院1982届毕业，东南大学教授",
    "bio": "建筑材料专家，中国工程院院士",
    "photo": "https://www.cae.cn/cae/html/main/colys/62672959.html"
  },
  {
    "id": "29",
    "name": "刘加平",
    "group": 2,
    "affiliation": "东南大学硕士毕业，首席教授",
    "bio": "土木工程材料专家，中国工程院院士，超高性能混凝土与混凝土收缩裂缝控制学术带头人",
    "photo": "https://www.cae.cn/cae/html/main/colys/33249616.html"
  },
  {
    "id": "30",
    "name": "张耀明",
    "group": 2,
    "affiliation": "东南大学教授",
    "bio": "化工、冶金与材料工程专家，中国工程院院士",
    "photo": "https://www.cae.cn/cae/html/main/colys/50611791.html"
  },
  {
    "id": "31",
    "name": "夏培肃",
    "group": 3,
    "affiliation": "中央大学电机系1945届毕业",
    "bio": "计算机专家，中国科学院院士，主持研制我国第一台自行设计的通用电子数字计算机，被誉为“中国计算机之母”",
    "photo": "https://commons.wikimedia.org/wiki/File:Xia_Peisu.jpg"
  },
  {
    "id": "32",
    "name": "陈星弼",
    "group": 3,
    "affiliation": "1953—1956年在南京工学院无线电系任讲师",
    "bio": "半导体及微电子学家，中国科学院院士，电子科技大学教授",
    "photo": "http://casad.cas.cn/ysxx2022/ygys/200906/t20090624_1807828.html"
  },
  {
    "id": "33",
    "name": "韦钰",
    "group": 3,
    "affiliation": "南京工学院电子工程系研究生毕业",
    "bio": "生物电子学专家，中国工程院院士，教育部原副部长、中国科协原副主席，东大生物医学工程学科奠基人之一",
    "photo": "https://www.cae.cn/cae/html/main/colys/84113761.html"
  },
  {
    "id": "34",
    "name": "崔铁军",
    "group": 3,
    "affiliation": "东南大学教授",
    "bio": "电磁超材料与微波技术专家，中国科学院院士",
    "photo": "https://rcb.seu.edu.cn/2019/1202/c56275a509337/page.htm"
  },
  {
    "id": "35",
    "name": "顾宁",
    "group": 3,
    "affiliation": "南京工学院无线电系本科、硕士、博士毕业，东南大学首席教授",
    "bio": "纳米医学材料专家，中国科学院院士",
    "photo": "https://rcb.seu.edu.cn/2021/1118/c56275a509339/page.htm"
  },
  {
    "id": "36",
    "name": "孙忠良",
    "group": 3,
    "affiliation": "南京工学院—东南大学教授",
    "bio": "毫米波技术专家，中国工程院院士",
    "photo": "https://rsc.seu.edu.cn/2007/0710/c3623a35116/page.htm"
  },
  {
    "id": "37",
    "name": "李幼平",
    "group": 3,
    "affiliation": "东南大学教授",
    "bio": "信息网络与电子系统专家，中国工程院院士",
    "photo": "https://rsc.seu.edu.cn/2011/0413/c3623a35121/page.htm"
  },
  {
    "id": "38",
    "name": "黄如",
    "group": 3,
    "affiliation": "东南大学电子工程系本科、硕士毕业",
    "bio": "微电子器件专家，中国科学院院士、发展中国家科学院院士，曾任东南大学校长",
    "photo": "https://ic.pku.edu.cn/szdw/ysfc/hr/33636f0f07244a1e919731dface7f190.htm"
  },
  {
    "id": "39",
    "name": "尤肖虎",
    "group": 3,
    "affiliation": "东南大学教授",
    "bio": "移动通信专家，国家杰出青年科学基金获得者，IMT-2020推进组专家",
    "photo": "https://rcb.seu.edu.cn/2023/1129/c56275a509342/page.htm"
  },
  {
    "id": "40",
    "name": "徐惠",
    "group": 3,
    "affiliation": "东南大学计算机系2005届毕业",
    "bio": "曾任百度首席产品架构师，从事数字科技产品设计与管理。"
  },
  {
    "id": "41",
    "name": "唐明述",
    "group": 4,
    "affiliation": "南京工学院—东南大学相关学科教授",
    "bio": "水泥化学与土木工程材料专家，中国工程院院士",
    "photo": "https://www.cae.cn/cae/html/main/colys/46816057.html"
  },
  {
    "id": "42",
    "name": "时铭显",
    "group": 4,
    "affiliation": "1952年考入南京大学化工系（院系调整脉络）",
    "bio": "化学工程与装备专家，中国工程院院士，长期从事多相流动与分离技术研究"
  },
  {
    "id": "43",
    "name": "钱崇澍",
    "group": 4,
    "affiliation": "东南大学生物系教授",
    "bio": "植物学家，中国科学院院士，中国近代植物学奠基人之一",
    "photo": "https://commons.wikimedia.org/wiki/File:%E9%92%B1%E5%B4%87%E6%BE%8D.png"
  },
  {
    "id": "44",
    "name": "赵承嘏",
    "group": 4,
    "affiliation": "东南大学数理化学部教授",
    "bio": "药物化学家，中国科学院院士，中国中草药化学研究先驱"
  },
  {
    "id": "45",
    "name": "梁希",
    "group": 4,
    "affiliation": "中央大学农学院教授",
    "bio": "林学家，中国科学院院士，新中国林业部部长",
    "photo": "https://commons.wikimedia.org/wiki/File:%E6%A2%81%E5%B8%8C.jpg"
  },
  {
    "id": "46",
    "name": "滕皋军",
    "group": 5,
    "affiliation": "南京铁道医学院（现东南大学医学院）硕士毕业，东南大学首席教授",
    "bio": "介入放射学与医学影像专家，中国科学院院士，长期从事介入医学的临床、教学与研究。",
    "photo": "https://rcb.seu.edu.cn/2021/1118/c56275a509338/page.htm"
  },
  {
    "id": "47",
    "name": "陆祖宏",
    "group": 5,
    "affiliation": "东南大学教授",
    "bio": "生物医学工程专家，国家杰出青年科学基金获得者"
  },
  {
    "id": "48",
    "name": "顾忠泽",
    "group": 5,
    "affiliation": "东南大学教授",
    "bio": "生物医学工程、组织工程与生物材料专家，国家杰出青年科学基金获得者"
  },
  {
    "id": "49",
    "name": "郭秉文",
    "group": 6,
    "affiliation": "南京高师教务主任、校长，国立东南大学首任校长",
    "bio": "中国第一位教育学博士，“东南大学之父”，开“学者治校、学术自由、学生自治”之风",
    "photo": "https://history.seu.edu.cn/2018/1029/c18668a244281/page.htm"
  },
  {
    "id": "50",
    "name": "陶行知",
    "group": 6,
    "affiliation": "南京高师教育科教授",
    "bio": "人民教育家、乡村教育家，创办晓庄师范等，提出生活教育理论",
    "photo": "https://commons.wikimedia.org/wiki/File:Tao_Xing-zhi.jpg"
  },
  {
    "id": "51",
    "name": "马寅初",
    "group": 6,
    "affiliation": "东南大学商科教授",
    "bio": "著名经济学家，后任北京大学校长",
    "photo": "https://commons.wikimedia.org/wiki/File:Ma_Yinchu3.jpg"
  },
  {
    "id": "52",
    "name": "汤用彤",
    "group": 6,
    "affiliation": "东南大学文科教授",
    "bio": "哲学史、佛学大师，后任北京大学校务委员会主席",
    "photo": "https://commons.wikimedia.org/wiki/File:%E6%B9%AF%E7%94%A8%E5%BD%A4.jpg"
  },
  {
    "id": "53",
    "name": "陆志韦",
    "group": 6,
    "affiliation": "东南大学教授",
    "bio": "心理学家，中国科学院院士，后任燕京大学校长",
    "photo": "https://commons.wikimedia.org/wiki/File:%E9%99%B8%E5%BF%97%E9%9F%8B.jpg"
  },
  {
    "id": "54",
    "name": "熊庆来",
    "group": 6,
    "affiliation": "东南大学数学系主任",
    "bio": "数学大师，后任云南大学校长，培养大批数学人才",
    "photo": "https://commons.wikimedia.org/wiki/File:%E7%86%8A%E6%85%B6%E4%BE%86.jpg"
  },
  {
    "id": "55",
    "name": "任鸿隽",
    "group": 6,
    "affiliation": "东南大学教授、副校长",
    "bio": "教育家、科学家，中国科学社社长，后任四川大学校长"
  },
  {
    "id": "56",
    "name": "陈鹤琴",
    "group": 6,
    "affiliation": "南京高师—东南大学教育科脉络",
    "bio": "儿童教育家，后任南京师范学院（今南京师范大学）院长",
    "photo": "https://commons.wikimedia.org/wiki/File:%E9%99%B3%E9%B6%B4%E7%90%B4.jpg"
  },
  {
    "id": "57",
    "name": "郑万钧",
    "group": 6,
    "affiliation": "东南大学—中央大学脉络",
    "bio": "林学家，中国科学院院士，后任南京林学院（今南京林业大学）院长"
  },
  {
    "id": "58",
    "name": "张江树",
    "group": 6,
    "affiliation": "中央大学—南京工学院脉络",
    "bio": "化学家，后任华东化工学院（今华东理工大学）院长"
  },
  {
    "id": "59",
    "name": "柳诒徵",
    "group": 7,
    "affiliation": "南京高师—东南大学教授",
    "bio": "史学大师，部聘教授，中国近代史学研究奠基人之一"
  },
  {
    "id": "60",
    "name": "吴梅",
    "group": 7,
    "affiliation": "东南大学教授",
    "bio": "词曲学大师，戏曲史与曲学教育大家"
  },
  {
    "id": "61",
    "name": "陈衡哲",
    "group": 7,
    "affiliation": "东南大学文科教授",
    "bio": "西洋史、文学学者，中国第一位女教授，与任鸿隽在梅庵举行文明婚礼",
    "photo": "https://commons.wikimedia.org/wiki/File:Chen_Hengzhe_Peking_University_Alumni_%28cropped%29.jpg"
  },
  {
    "id": "62",
    "name": "吴宓",
    "group": 7,
    "affiliation": "东南大学教授",
    "bio": "西洋文学、比较文学学者，“哈佛三杰”之一"
  },
  {
    "id": "63",
    "name": "宗白华",
    "group": 7,
    "affiliation": "东南大学—中央大学脉络教授",
    "bio": "美学大师，中国现代美学奠基人之一"
  },
  {
    "id": "64",
    "name": "方东美",
    "group": 7,
    "affiliation": "东南大学—中央大学脉络教授",
    "bio": "哲学史家，“柏大三俊”之一"
  },
  {
    "id": "65",
    "name": "梅光迪",
    "group": 7,
    "affiliation": "东南大学西洋文学系主任",
    "bio": "西洋文学学者，学衡派代表人物"
  },
  {
    "id": "66",
    "name": "张其昀",
    "group": 7,
    "affiliation": "中央大学地理系教授",
    "bio": "历史地理学家，中国地理学重要开拓者",
    "photo": "https://commons.wikimedia.org/wiki/File:19690410%E5%BC%B5%E5%85%B6%E6%98%80.jpg"
  },
  {
    "id": "67",
    "name": "胡焕庸",
    "group": 7,
    "affiliation": "中央大学地理系教授",
    "bio": "人口地理学家，提出著名的“胡焕庸线”（瑷珲—腾冲线）",
    "photo": "https://commons.wikimedia.org/wiki/File:Hu_Huanyong.jpg"
  },
  {
    "id": "68",
    "name": "徐悲鸿",
    "group": 7,
    "affiliation": "中央大学艺术系教授",
    "bio": "国画、油画大师，现代美术教育奠基人之一",
    "photo": "https://commons.wikimedia.org/wiki/File:XuBeihong.jpg"
  },
  {
    "id": "69",
    "name": "傅抱石",
    "group": 7,
    "affiliation": "中央大学艺术系教授",
    "bio": "国画大师，“新金陵画派”代表人物",
    "photo": "https://commons.wikimedia.org/wiki/File:FuBaoshi1947.jpg"
  },
  {
    "id": "70",
    "name": "陈之佛",
    "group": 7,
    "affiliation": "中央大学艺术系教授（1930—1962）",
    "bio": "工笔花鸟画大师，中央大学校徽设计者",
    "photo": "https://commons.wikimedia.org/wiki/File:Chen_Zhifo.JPG"
  },
  {
    "id": "71",
    "name": "李剑晨",
    "group": 7,
    "affiliation": "中央大学—南京工学院建筑系教授",
    "bio": "水彩画大师，中国水彩画教育开拓者之一"
  },
  {
    "id": "72",
    "name": "李国鼎",
    "group": 8,
    "affiliation": "中央大学物理系1930届毕业",
    "bio": "台湾财经与科技专家，推动台湾经济建设与科技产业发展"
  },
  {
    "id": "73",
    "name": "刘国耀",
    "group": 8,
    "affiliation": "东南大学热工自动化教研室毕业、留校工作",
    "bio": "从事工业自动化，参与创办并领导南京科远自动化集团。"
  },
  {
    "id": "74",
    "name": "于燮康",
    "group": 8,
    "affiliation": "南京工学院管理工程专业1985届毕业",
    "bio": "高级经济师，曾在江苏长电科技从事企业经营管理。"
  },
  {
    "id": "75",
    "name": "赵大春",
    "group": 8,
    "affiliation": "东南大学1993届校友",
    "bio": "曾任中国移动通信集团有限公司副总裁。",
    "source": "https://seuaa.seu.edu.cn/2019/0306/c51466a264684/page.htm",
    "photo": "https://seuaa.seu.edu.cn/2019/0306/c51466a264684/page.htm"
  }
];
