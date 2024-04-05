<template>
	<div>
		<strong class="form-title" v-if="title">{{title}}</strong>
		<select type="text" class="form-control form-control-store" v-model="val" @change="changeOption" :disabled="disable">
			<option v-for="option in options" :value="option.value">{{option.label}}</option>
		</select>
	</div>
</template>
<script>
    export default {
        name: 'FormSelect',
        props:{
            value: '',
            options:[],
            title: null,
            disable:{
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                val : null
            }
        },
        mounted() {
            this.val = this.value;
        },
        watch: {
            value:function() {
                this.val = this.value;
            }
        },

        methods:{
            changeOption(event){
                this.$emit('input', event.target.value);
                this.$emit('updateOption');
            },
        }
    }
</script>
<style type="text/css">

</style>