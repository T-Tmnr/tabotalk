// TODO スクロール問題(本当に今ひどい)
// TODO 色を変える処理(input)
// TODO リファクタリング
// TODO アイコン考慮
// TODO 中国語問題（相談）
// TODO レスポンスを少し遅らせたい
// TODO ロゴ
var API_URL='https://script.google.com/macros/s/AKfycbweJFfBqKUs5gGNnkV2xwTZtZPptI6ebEhcCU2_JvOmHwM2TCk/exec';
var buildQuery = function(data){
  var q = [];
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      q.push(`${key}=${encodeURIComponent(data[key])}`);
    }
  }
  return q.join('&');
}

var say = function (text, lang) {
  var utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  speechSynthesis.speak(utter);
}

var app = new Vue({
  el: "#app",
  data: {
    message: "", // 入力データの一時変数
    logs: [], // 入力データを詰めていくlist
    inputVoice: false, // 音声入力が行われた時trueに
    recognitionText: "音声入力", // ボタンのラベル
    outputLang: 'en',
  },
  methods: {
    // 送信ボタンを押された場合の処理
    submit: function(event) {
      this.inputVoice = false;
      if (this.message === "") {
        return;
      }
      this.pushLogs("You", this.message, "img/user.png");
      // 翻訳モード時の処理
      var qs = buildQuery({
        text: this.message,
        source: 'ja',
        target: this.outputLang,
      });
      axios
        .get(`${API_URL}?${qs}`)
        .then(response =>{
          this.pushLogs("Chat bot", response.data, "img/route66.png");
          say(response.data, this.outputLang);
        })
        .catch(error => {
          console.log(error);
        });
      this.message = "";
    },
    // 音声入力の処理
    startSpeech: function(event) {
      this.inputVoice = true;
      const speech = new webkitSpeechRecognition();
      speech.lang = "ja-JP";
      speech.onresult = e => {
        speech.stop();
        if (e.results[0].isFinal) {
          // 翻訳モードの時の処理
          var voiceText = e.results[0][0].transcript;
          this.pushLogs("You", voiceText, "img/user.png");
          var qs = buildQuery({
            text: voiceText,
            source: 'ja',
            target: this.outputLang
          });
          axios
            .get(`${API_URL}?${qs}`)
            .then(response => {
              this.pushLogs("Chat bot", response.data, "img/route66.png");
              say(response.data, this.outputLang);
            })
            .catch(error => {
              console.log(error);
            });
        }
        false;
      };
      speech.onend = () => {
        this.recognitionText = "音声入力";
      };
      speech.onsoundstart = () => {
        this.recognitionText = "Processing";
      };
      speech.onsoundend = () => {
        this.recognitionText = "Waiting";
      };
      speech.start();
    },
    
    pushLogs: function(speaker, text, img) {
      this.logs.push({ speaker: speaker, text: text, img: img });
      Vue.nextTick(()=>{
        this.$refs.scrollp.scrollTop = this.$refs.scrollp.scrollHeight;
      });
    }
  }
});
