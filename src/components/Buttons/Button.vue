<template>
	<div>
		<button :disabled="disabled" class="btn" v-bind:class="[outline ? 'button--line-'+color : 'button--'+color, shadow ? 'button-shadow' : '']" @click="clicked" data-toggle="tooltip" :title="tooltip">
			<div class="d-flex align-items-center">
				<i v-if="icon" :class="[icon,!hide && title ? 'mr-2' : '']"></i>
				<span v-bind:class="{'hide_btn':hide}">{{title}}</span>
			</div>
		</button>
	</div>
</template>
<script>
	export default{
		name: "Button",

		props:{
			icon:'',
			title: '',
			outline: false,
			color:'',
			tooltip:'',
			disabled: false,
			hide: false,
			shadow: false,
		},

		methods:{
			clicked(){
				this.$emit('action');
			},
		}
	}
</script>
<style>
	.btn {
		width: auto;
		align-items: center;
		border-radius: 15px!important;
		font-weight: 700!important;
	}
	.btn:focus{
		box-shadow: none!important;
	}

	.hide_btn {
		white-space: nowrap;
		width: 0;
		overflow: hidden;
		align-items: center;
		margin-left: 0;
		transition: width 0.1s ease;
	}
	.btn:hover .hide_btn {
		width: 100%;
		margin-left: 0.5rem;
		transition: width 0.3s ease;
	}
	.btn.button--green {
		background: var(--green-store);
		color: #FFF;
		font-size: 14px;
	}
	.btn.button--green:hover {
		background: var(--dark-green-store);
		color: #FFF;
	}
	.btn.button--line-green {
		background: #3FD47844;
		color: var(--green-store);
		font-size: 14px;
        border: 1px solid var(--green-store);
	}
	.btn.button--line-green:hover {
		background: #3FD47899;
		color: var(--green-store);
	}
	.btn.button--red {
		background: var(--red-store);
		color: #FFF;
		font-size: 14px;
	}
	.btn.button--red:hover {
		background: var(--red-store);
		color: #FFF;
	}
	.btn.button--line-red {
		background: #DB235644;
		color: var(--red-store);
		font-size: 14px;
        border: 1px solid var(--red-store);
	}
	.btn.button--line-red:hover {
		background: #DB235699;
		color: var(--red-store);
	}
	.btn.button--blue {
		background: var(--blue-store);
		color: #FFF;
		font-size: 14px;
	}
	.btn.button--blue:hover {
		background: var(--blue-store);
		color: #FFF;
	}
	.btn.button--line-blue {
		background: #0E78F944;
		color: var(--blue-store);
		font-size: 14px;
        border: 1px solid var(--blue-store);
	}
	.btn.button--line-blue:hover {
		background: #0E78F999;
		color: var(--blue-store);
	}
	.btn.button--logout {
		background: transparent;
		color: var(--red-store);
		font-size: 14px;
		font-weight: bold;
		border: 1px solid var(--red-store);
	}
	.btn.button--logout:hover {
		background: var(--red-store);
		color: #FFF;
	}  
	.button-shadow{
		box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
	}
</style>