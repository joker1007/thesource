var AnimationUtil = {};
(function(util) {
  var DMAX = 1000;
  var last = 0;
  var canvas;
  var source;
  var lines = 0;
  var lineHeight = 0;
  var lineWidth  = 0;
  var c;
  var context;
  //==========================================================
  // http://www.din.or.jp/~hagi3/JavaScript/JSTips/DHTML/Library.htm
  // _dom : kind of DOM. IE4 = 1, IE5+ = 2, NN4 = 3, NN6+ = 4, others = 0
  _dom = 0;

  //==========================================================
  function getDivWidth(div){
    if(_dom==4 || _dom==2) return div.offsetWidth;
    if(_dom==1)            return div.style.pixelWidth;
    if(_dom==3)            return div.clip.width;
    return 0;
  }

  //==========================================================
  function getDivHeight(div){
    if(_dom==4 || _dom==2) return div.offsetHeight;
    if(_dom==1)            return div.style.pixelHeight;
    if(_dom==3)            return div.clip.height;
    return 0;
  }

  //==========================================================
  // HTML エンティティ エンコード
  function encode_entities(buf) {
    var s = buf;
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');
    return s;
  }

  //==========================================================
  // n 以下の整数乱数を生成
  function rand(n) {
    return Math.floor( (Math.random() * n) );
  }

  //==========================================================
  function getDiv() {
    var div = document.getElementById("div"+last);
    last ++;
    return div;
  }

  //==========================================================
  function drawLine(x1, y1, x2, y2) {
    //alert(x1+'/'+y1+'/'+x2+'/'+y2);
    context.beginPath();
    context.moveTo(x1,y1);
    context.lineTo(x2,y2);
    context.stroke();
  }

  //==========================================================
  // コメントHTML取得
  function getCommentHTML(comment) {
    var buf = '';
    buf += '<table cellpadding="0" cellspacing="0" style="table-layout:fixed;">';
    buf += '<tr><td nowrap>';
    buf += comment.body;
    buf += '</td></tr></table>';
    return buf;
  }

  //==========================================================
  // コメントボックス1個表示 (再帰)
  function viewComment(comments, i) {
    // リストの終端に達していれば終了
    if(i >= comments.length) return;

    // div 取得
    var div = getDiv();
    if (div == undefined) {
      return;  // 終了
    }
    var s = div.style;
    var comment_box = $(div);

    // スタイル設定：サイズ関連
    comment_box.css("font-size", 12);
    comment_box.css("height", lineHeight + 2);
    comment_box.css("width", 'auto');  // ★テキスト幅に合わせる。

    // アニメーション開始座標算出
    var x1 = Math.floor( (lineWidth - comment_box.width()) / 2 );
    var y1 = Math.floor( lineHeight * comments[i].line - (lineHeight / 2) );

    // アニメーション完了座標算出
    //var x2 = lineWidth - 100;
    var x2 = Math.floor( x1 - 200 + rand(400) );
    var y2 = Math.floor( y1 - (4 * lineHeight) + rand(8 * lineHeight) );
    if (y2 < 0)
      y2 = 0;
    if (x2 > -50 && x2 < 50)
      x2 = 50;
 
    // スタイル設定：位置、デザイン関連
    comment_box.css("left", x1);
    comment_box.css("top", y1);
    comment_box.css("border", "solid 1px");
    comment_box.css("border-color", "red");
    comment_box.css("background-color", "#FFCC99");

    // 半透明スタイル
    comment_box.css("filter", "alpha(opacity=80)");
    comment_box.css("opacity", "0.80");

    comment_box.html(getCommentHTML(comments[i]));

    // 線を引く
    drawLine(x1+lineWidth*0.2, y1, x2+lineWidth*0.2, y2);
    console.log(div.style);

    // アニメーション＋次へ
    i++;
    JSTweener.addTween(s, {
      time: 0.2,
      transition: 'easeOutCubic',
      top: y2,
      left: x2,
      delay: 0.001,
      onStart: viewComment,
      onStartParams: [comments, i]
    });
  }

  //==========================================================
  // コメントボックスをリストを基にすべて表示
  function viewComments(comments) {
    viewComment(comments, 0);  // 再帰
  }

  //==========================================================
  // TOPページ表示
  function init() {
    var buf='';
    
    // div 生成
    for(i=0; i<DMAX; i++) {
      $("#contents").append($('<div id="div' + i + '" class="abs"></div>'));
    }

    // エレメント取得
    canvas = document.getElementById("canvas");

    // 行数取得
    lines = $("div.source-line").length;

    var source_body = $(".source-body");

    // 一行あたりの高さ
    lineHeight = source_body.height() / lines;

    // 幅
    lineWidth = source_body.width();

    // canvas 作成
    var bitmap = document.getElementById("bitmap");

    // canvas 解像度設定
    bitmap.setAttribute('width', source_body.width());
    bitmap.setAttribute('height', source_body.height());

    // 描画コンテキスト取得 ※サイズがかわるたびに取り直す必要がある
    if (bitmap.getContext) {
      context = bitmap.getContext('2d');
      context.strokeStyle = 'red';
    }
  }

  util.init = init;
  util.viewComments = viewComments;

  //==========================================================
})(AnimationUtil);
