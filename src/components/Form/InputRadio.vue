<template>
	<div class="radio--store">
		<strong class="form-title" v-if="title != ''">{{title}}</strong>
		<br v-if="title != ''">
		<div class="d-flex">
			<label v-for="option in options" :key="option.value" style="margin-bottom: 0!important;">
				<input type="radio" :name="id_" :value="option.value" :checked="option.value == value" @change="$emit('input', option.value)"> 
				{{ option.label }}
			</label>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'InputRadio',
		props: {
			value: '',
			options: '',
			title: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				id_ : Utils.generateId()
			}
		}
	}
</script>
<style type="text/css">
.radio--store label input {
	filter: hue-rotate(180deg);
}
.radio--store label {
	margin-right: 2.5rem;
}

</style>