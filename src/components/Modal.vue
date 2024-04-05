<template>
	<div v-bind:id="modal_id_" class="modal-store" :hidden="!showing" v-on:click.self="hide()">
		<div class="modal-dialog-store" v-bind:class="{'full-modal':full}">
			<div class="modal-content-store">
				<div class="d-flex w-100 p-2">
					<div class="d-flex flex-fill align-items-center modal-header-store">
						<div><slot name="header"></slot></div>
					</div>
					<div class="d-flex flex-row-reverse bd-highlight">
						<div class="button-close-modal my-auto mr-2">
							<button type="button" class="close" aria-label="Close" v-on:click="hide()">
								<span aria-hidden="true"><i class="las la-times"></i></span>
							</button>
						</div>
					</div>
				</div>
				<div class="modal-body-store">
					<div><slot name="body"></slot></div>
				</div>
				<div class="modal-footer-store">
					<div><slot name="footer"></slot></div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name:'Modal',
		props: {
			hideCallback: {
				default: null,
				type: Function
			},
			full: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				modal_id_ : Utils.generateId(),
				showing:false,
			}
		},

		mounted(){
			var self = this;
			$(document).keyup(function(ev){
				if(ev.keyCode == 27) {
					if(self.showing)
						self.hide();
				}
			})
		},
		methods: {
			show() {
				this.showing = true;
			},
			hide() {
				var self = this;
				if(this.hideCallback){
					this.hideCallback()
					.then(function() {
						self.showing = false;
					});
				}
				else{
					this.showing = false;
				}
			},
			showLoading() {
				Utils.showLoading('#'+this.modal_id_);
			},
			closeLoading() {
				Utils.closeLoading('#'+this.modal_id_);
			}
		}
	}
</script>
<style>
	.modal-store {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		width: 100%;
		height: 100%;
		background-color: #0008;
		transition: transform 0.3s ease-out;
	}
	.modal-dialog-store {
		transition: transform 0.3s ease-out;
		max-width: 800px;
		flex-direction: column;
		justify-content: center;
		height: calc(100% - 3.5rem);
		display: flex;
		align-items: center;
		position: relative;
		width: auto;
		pointer-events: none;
		margin: 1.75rem auto;
	}
	.full-modal {
		max-width: unset;
		width: 100%!important;
		margin: 0!important;
		height: 100%!important;
	}
	.full-modal .modal-content-store {
		width: calc(100% - 1.75rem)!important;
		height: 100%;
		margin: 1.75rem;
	}
	.modal-content-store {
		max-height: none;
		overflow: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		pointer-events: auto;
		background-color: #fff;
		background-clip: padding-box;
		border: 1px solid rgba(0, 0, 0, 0.2);
		outline: 0;
		border-radius: 0.5rem;
	}
	.modal-header-store {
		justify-content: space-between;
		border-top-left-radius: calc(0.3rem - 1px);
		border-top-right-radius: calc(0.3rem - 1px);
		border-bottom: 1px solid #0000001A;
		padding: 0.1rem 0.1rem;
	}
	.modal-header-store>div {
		align-items: center;
		padding: 0.3rem 1rem;
	}
	.modal-body-store {
		overflow-y: auto;
		padding: 2.2rem;
		position: relative;
		flex: 1 1 auto;
	}
	.modal-footer-store {
		flex-shrink: 0;
		margin: 0 auto;
		border-top: 1px solid #0000001A;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		border-bottom-left-radius: calc(0.3rem - 1px);
		border-bottom-right-radius: calc(0.3rem - 1px);
	}
	.modal-footer-store  > * {
		margin: 0.25rem;
	}
	.button-close-modal{
		margin: 25px 25px 0 0;
	}
	.button-close-modal i{
		font-size: 18px;
	}
	.close {
		float: right;
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1;
		color: #000;
		text-shadow: 0 1px 0 #fff;
		opacity: .5;
	}
	button.close {
		padding: 0;
		background-color: transparent;
		border: 0;
	}

	@media (max-width: 992px){
		.modal-dialog-store{
			margin: 1.75rem;
		}
	}
</style>
