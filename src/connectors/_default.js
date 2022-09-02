export default class _Connector {
	constructor() {}

	getAll() {}
	get() {}
	add(id, guidelines, payload, rules, upGuideline) {}
	remove(id) {}
	update(id, controller) {
		const {
			addRules = [],
			removeRules = [],
			addGuidelines = [],
			removeGuidelines = [],
			addUpGuidelines = [],
			removeUpGuidelines = [],
			payload = {},
		} = controller
	}
}
