import {MongoClient} from "mongodb"

export default class MongoConnector {
	constructor(string, dbName, collection) {
		this._client = new MongoClient(string)
		this._connection = this._client.connect()
		this._dbName = dbName
		this._collection = collection

		this._getColl().then((coll) => {
			coll.createIndex(
				{
					id: 1,
				},
				{
					unique: true,
					name: "Guidelines Id",
				},
			)
		})
	}

	async _getColl() {
		await this._connection
		return this._client.db(this._dbName).collection(this._collection)
	}

	async getAll() {
		return await (await this._getColl()).find().toArray()
	}

	async get(id) {
		return await (await this._getColl()).findOne({id})
	}

	async add(id, guidelines, payload, rules, upGuideline) {
		try {
			const doc = {
				id,
				guidelines,
				payload,
				rules,
				upGuideline,
			}

			await (await this._getColl()).insertOne(doc)
		} catch (error) {
			throw new Error("Guideline is exists")
		}
	}

	async remove(id) {
		await (await this._getColl()).deleteOne({id})
		return
	}

	async update(id, controller) {
		const {addRules = [], removeRules = [], addGuidelines = [], removeGuidelines = [], addUpGuidelines = [], removeUpGuidelines = [], payload} = controller

		const coll = await this._getColl()

		await coll.updateOne(
			{id},
			{
				$pull: {rules: {$in: removeRules}, guidelines: {$in: removeGuidelines}, upGuideline: {$in: removeUpGuidelines}},
				$setOnInsert: {id},
			},
			{upsert: true},
		)

		await coll.updateOne(
			{id},
			{
				$push: {rules: {$each: addRules.map((e) => string2Rule(e))}, guidelines: {$each: addGuidelines}, upGuideline: {$each: addUpGuidelines}},
				...(payload ? {$set: {payload}} : {}),
				$setOnInsert: {id},
			},
			{upsert: true},
		)
	}
}

function string2Rule(string) {
	const exception = string.startsWith("-")
	return {
		_v0: "",
		...Object.fromEntries(
			string
				.slice(+exception)
				.split(".")
				.map((e, i) => ["_v" + i, e]),
		),
		exception,
	}
}
