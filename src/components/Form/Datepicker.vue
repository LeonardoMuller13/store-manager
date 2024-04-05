<template>
  <div>
    <strong class="form-title" v-if="title">{{title}}</strong>
    <br v-if="title">
    <date-picker v-model="model" :value-type="valueType" :lang="lang" :format="format" :type="type"@input="handleInput" :default-value="defaultValue" :range="range" :disabled="disabled" :minute-step="minuteStep" :time-title-format="time_title_format">
    </date-picker>
</div>
</template>
<script>
    import DatePicker from 'vue2-datepicker'
    import 'vue2-datepicker/index.css'
    import 'vue2-datepicker/locale/pt-br'
    export default {
        name: 'Datepicker',
        components:{DatePicker},
        data() {
           return {
              model:null,
          }
      },
      props:{
        value: '',
        title: null,
        type:'',
        format:'',
        lang:'',
        valueType:'',
        defaultValue:null,
        range: false,
        disabled: true,
        minuteStep: '',
        time_title_format:''
    },
    watch: {
        value: function() {
            this.model = this.value;
        }
    },
    mounted(){
        this.model = this.value;
    },

    methods:{
       handleInput (event) {
          this.$emit('input', this.model)
          this.$emit('updateModel');
      },
  }
}
</script>
<style type="text/css">

.mx-datepicker > .mx-input-wrapper > .mx-input{
    border-radius: 15px;
}
.mx-input:hover, .mx-input:focus {
    border-color: #ced4da;
}

div.mx-calendar{
    width: 300px;
    padding: 5px 12px 50px 12px;
}
.mx-calendar-content td.cell.active {
    color: var(--black-charbel);
    background-color: #ffa60261;
}
.mx-calendar-content td.cell.active>div {
    color: var(--black-charbel);
}
.mx-calendar-content td div {
    color: #7A7C85;
    opacity: 85%;
}
.mx-calendar-content th {
    color: #7A7C85;
}
table.mx-table{
    border-spacing: 5px;
}
.mx-table-date td{
    border-radius: 0.75rem;
    background: #DFE0E2;
    box-shadow: 3px 2px 4px #0D0E160D;
}
.mx-btn-text{
    color: #3E404E;
    opacity: 85%;
    font-weight: 900 !important;
    font-family: 'Quicksand';
    font-size: 16px;
}
.mx-datepicker-range {
    width: fit-content;
}
</style>