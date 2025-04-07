const VKAudio = require("./api.js")
const express = require('express')
const { getPaletteFromURL } = require('color-thief-node');
const { API, resolveResource } = require('vk-io');
const cfg = require('cfg.json')

const app = express()
const port = cfg.PORT
const VKToken = cfg.VKTOKEN
const KateToken = cfg.KATEMOBILETOKEN

const audio = new VKAudio(VKToken)
const api = new API({
    token: VKToken
})

app.get('/audio.getAudioByUser', async (req, res) => {

	let params = {
		"oid": true,
		"aid": false,
		"q": false,
		"offset": false
	}

	let error = checkQuery(req.query, params, res)

	if(error){
		res.send(error)
		return
	}
	let resource
	try{
		resource = await resolveResource({
		    api,
		    resource: req.query.oid
		});
	}catch(e){
		res.send({
				"count": 0,
				"items": []
		})
		return
	}

	let offset = 0
	if(req.query.offset){
		offset = req.query.offset
	}

	let count = 100
	if(req.query.count){
		count = req.query.count
	}

	audio.getUserAudios(resource.id, count, offset).then(data => {
		if(data.hasOwnProperty('error')){
			res.send({
				"count": 0,
				"items": []
			})
			return
		}
		res.send({
			"count": data.response.count,
			"items": data.response.items
		})
	})
})

app.get('/audio.getAudioById', (req, res) => {

	let params = {
		"oid": true,
		"aid": true,
		"q": false,
		"offset": false
	}

	let error = checkQuery(req.query, params, res)

	if(error){
		res.send(error)
		return
	}
	let audios = []
		audios.push(`${req.query.oid}_${req.query.aid}`)
	
	audio.getInfoById(audios).then(data => {
		res.send(data)
	})
})

app.get('/audio.getAudioLink', (req, res) => {

	let params = {
		"oid": true,
		"aid": true,
		"q": false,
		"offset": false
	}

	let error = checkQuery(req.query, params, res)

	if(error){
		res.send(error)
		return
	}
	audio.getLinkById(req.query.oid, req.query.aid, KateToken).then(data => {
		res.send({
			"url": data
		})
	})
})


app.get('/audio.getColorFromCover', async (req, res) => {

	if(!req.query.hasOwnProperty("url")){
		return res.send({
			"error": "invalid request"
		})
	}

	let url = req.query.url
	if(!url.startsWith('https://')){
		return res.send({
			"error": "invalid request"
		})
	}

    let pallete = await getPaletteFromURL(url)
    res.send({
    	"pallete": pallete
    })


})


app.get('/audio.search', (req, res) => {
	
	let params = {
		"oid": false,
		"aid": false,
		"q": true,
		"offset": false
	}

	let error = checkQuery(req.query, params, res)

	if(error){
		res.send(error)
		return
	}
	if(!req.query.hasOwnProperty('perf')){
		req.query.perf = 0
	}
	audio.search(req.query.q, req.query.perf).then(data => {
		res.send({
			"count": data.response.count,
			"items": data.response.items
		})
	})
})


app.listen(port, () => {

    console.log(`vkaudio is running on ${port}`)
})


function checkQuery(query, params, res) {

    if (params.oid) {

        if (!query.oid) {

            return {
                "error": "One of the parameters is missing (oid)"
            }
        }
    }

    if (params.aid) {

        if (!query.aid) {

            return {
                "error": "One of the parameters is missing (aid)"
            }
        }

        let aid = Number(query.aid)
        if (!Number.isInteger(aid) || aid === 0 || query.aid.length > 10) {

            return {

                "error": "One of the parameters is invalid (aid)"
            }
        }
    }

    if (params.q && !query.q) {

        return {

            "error": "One of the parameters is missing (q)"
        }
    }

    if (params.offset && !query.offset) {

        return {

            "error": "One of the parameters is missing (offset)"
        }
    }

    return false;
}
