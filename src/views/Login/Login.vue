<template>
	<div class="h-100">
		<div class="login h-100 d-flex align-itens-center">
			<div class="card col-sm-12 col-md-12 col-lg-6 mx-auto my-auto card-store card-login" style="text-align: center;">
				<div class="card-body p-5 d-flex flex-column justify-content-center h-100">
					<div class="card-title mb-4">
						<img :src="logo" style="height:130px">
					</div>
					<transition name="fade" :duration="{ enter: 800, leave: 100 }">
						<div v-if="error" class="alert alert-danger alert-dismissible mt-2" role="alert">
							<span>{{error}}</span>
							<button type="button" class="close" v-on:click="error=null" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
					</transition> 
					<Input type="email" v-model="email" placeholder="Email" class="mx-auto w-75 mb-2" />
					<Input type="password" v-model="password" @updateModel="login()" placeholder="Senha" class="mx-auto w-75 mb-2" />	
					<Button title="Login" color="green" @action="login()" :typeNew="true" />
				</div>	
			</div>
		</div>
	</div>
</template>
<script>
	import * as LoginServices from '../../services/LoginServices.js'
	import * as LoginUtils from '../../utils/LoginUtils.js'
	import Input from '@/components/Form/Input'
	import Button from '@/components/Buttons/Button'
	import logoHeader from '@/assets/logo.png'

	export default {
		name: "Login",
		components: { Input, Button },

		data() {
			return {
				email: null,
				password: null,
				error:null,
				logo:logoHeader
			}
		},

		mounted(){
			if(LoginUtils.isLogedIn()){
				this.$router.replace({name:"dashboard"});
			}
		},

		methods: {
			login(){
				var self = this;
				Utils.showLoading('.login');
				LoginServices.signIn(this.email, this.password)
				.then(function(credentials){
					LoginUtils.login(credentials);
                    if(Utils.isMobile()) {
                        self.$router.replace({name:"billing"});
                    } else {
                        self.$router.replace({name:"dashboard"});
                    }
					self.error = null;
				})
				.catch(function(err){
					Utils.closeLoading('.login');
					self.error = "Usuário ou senha incorretos"
				})
				
			}
		}
	}
</script>
<style>

	@media (max-width: 768px){
		.card-login{
			height: 100%;
			background: transparent!important;
			padding: 0;
		}
		.card-login > .card-body{
			padding: 0!important;
		}
	}
</style>