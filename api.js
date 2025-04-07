const axios = require("axios")

module.exports = class VKAudio{

	constructor(token) {

		this.token = token
		this.api_url = 'https://api.vk.com/method/'
		this.headers = {
			'User-Agent': 'VKAndroidApp/56 lite-460 (Android 5.4.2; SDK 19; x86; unknown Android SDK built for x86; en)'
		}
	}

	async getUserAudios(oid, count=100, offset=0){

		let params = {
			"owner_id": oid,
			"count": count,
			"offset": offset
		}

		let result = await this.api("audio.get", params)

		return result
	}

	async getInfoById(audios){

		let audio_ids = audios.join(", ")
		let params = {
			"audios": audio_ids
		}

		let result = await this.api("audio.getById", params)

		return result
	}

	async getLinkById(oid, aid, kateToken){

		let audio_id = `${oid}_${aid}_`
		let params = {
			"audios": audio_id,
			"access_token": kateToken
		}

		let result = await this.api("audio.getById", params);
			result = result.response[0].url

		return result
	}

	async search(text, performer=0, count=20, offset=0){

		let params = {
			"q": text,
			"count": count,
			"offset": offset,
			"performer_only": performer
		}
		
		let result = await this.api("audio.search", params);

		return result
	}

	async api(method, params, headers=null){

		if(!params.hasOwnProperty("v")){
			params["v"] = "5.100"
		}
		
		if(!params.hasOwnProperty("access_token")){
			params["access_token"] = this.token
		}

		if(!headers){
			headers = this.headers
		}

		let result = await axios.get(this.api_url+method+"?"+new URLSearchParams(params).toString(), {headers: headers})

		return result.data
	}
}
