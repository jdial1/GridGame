/* Use Matrice math to look for connected sections */
window.onload = () => {
  Vue.use(new VueSocketIO({connection: 'https://battle-boxes.herokuapp.com'}));
  // Vue.use(new VueSocketIO({connection: 'http://192.168.1.236:8080/'}));
  new Vue({
    el: "#app",
    data: {
      tcolumns:[' ',1,2,3,4,5,6,7,8],
      my_id:"Getting User ID...",
      active_player_toggle:-1,
      op_id:"",
      users:0,
      users_list:{},
      letter_to_num : {'A':0,'B':1,'C':2,'D':3,'E':4,'F':5,'G':6,'H':7},
      header_rows:['A ','B ','C ','D ','E ','F ','G ','H '],
      f_col:'1',
      s_col:'2',
      f_row:'A',
      s_row:'B',
      my_grid_seen:1,
      op_grid_seen:1,
      my_gridnum_seen:1,
      op_gridnum_seen:1,
      look_for_op:false,
      my_grid:
      [
      [1,0,3,0,0,4,0,4],
      [2,0,0,4,4,4,0,4],
      [3,3,0,1,0,4,0,4],
      [4,3,3,1,1,4,4,4],
      [1,3,1,1,0,0,3,0],
      [2,3,2,0,0,1,0,0],
      [3,3,2,0,2,0,4,0],
      [4,0,2,0,4,0,0,4]
      ],
      op_grid:
      [
      [1,0,3,0,0,4,0,0],
      [1,0,0,4,4,2,3,0],
      [1,0,0,1,0,2,0,3],
      [1,0,2,0,1,4,3,0],
      [1,0,0,1,0,0,3,0],
      [2,0,2,0,0,2,0,0],
      [3,1,0,0,2,0,4,0],
      [4,0,2,0,1,0,0,4]
      ]
    },
    methods: {
      button_get_id: function(){

        this.$socket.emit('GET_CLIENT_ID');
      },

      button_guess_sent: function(){

        if(this.active_player_toggle !== 0 ){
          this.$socket.emit('SEND_GUESS', [this.f_col-1,this.s_col-1,this.f_row,this.s_row,this.my_id,this.op_id]);
        }
        this.active_player_toggle=0;
      },

      looking_button_sent: function(){
        this.look_for_op=!this.look_for_op;
        this.$socket.emit('SET_LOOKING_FOR_OPP_FLAG', {'name':this.my_id,'looking_for_opp':this.look_for_op});
      },


      clear_my_grid: function () {

        this.my_grid = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
      	];
      },

      clear_op_grid: function () {

        this.op_grid = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
      	];
      },

      chk_nbrs: (grid,row,col,side,number) => {

        if (side === 'left'){
          if (col === 0){return true};
          if (grid[row][col-1] === number){return false};
          return true;
        }
        if (side === 'right'){
          if (col === 7){return true};
          if (grid[row][col+1] === number){return false};
          return true;
        }
        if (side === 'top'){
          if (row === 0){return true};
          if (grid[row-1][col] === number){return false};
          return true;
        }
        if (side === 'bottom'){
          if (row === 7){return true};
          if (grid[row+1][col] === number){return false};
          return true;
        }
      },

      set_grid:function(col_one,col_two,row_one,row_two,grid_nums){

        this.op_grid[row_one][col_one+1]=grid_nums[0];
        this.op_grid[row_one][col_two+1]=grid_nums[1];
        this.op_grid[row_two][col_one+1]=grid_nums[2];
        this.op_grid[row_two][col_two+1]=grid_nums[3];
        this.$forceUpdate();
      },

      get_grid:function(col_one,col_two,row_one,row_two){

        let grid_nums=[];

        grid_nums[0]=this.my_grid[this.letter_to_num[row_one]][col_one];
        grid_nums[1]=this.my_grid[this.letter_to_num[row_one]][col_two];
        grid_nums[2]=this.my_grid[this.letter_to_num[row_two]][col_one];
        grid_nums[3]=this.my_grid[this.letter_to_num[row_two]][col_two];

        return grid_nums;
      }
    },

    sockets:{

      CLIENT_ID:function(data){

        this.my_id=data.name;
      },

      SERVER_GUESS_RESPONSE:function(data){

        let grid_pos=data[0];
        let grid_nums=data[1];

        let col_one = grid_pos[0]-1;
        let col_two = grid_pos[1]-1;
        let row_one = this.letter_to_num[grid_pos[2]];
        let row_two = this.letter_to_num[grid_pos[3]];
        this.set_grid(col_one,col_two,row_one,row_two,grid_nums);
      },

      GUESS:function(data){

        this.op_id=data[4];
        let coords=[data[0],data[1],data[2],data[3]];
        data=[coords,this.get_grid(data[0],data[1],data[2],data[3]),this.my_id,this.op_id];
        this.$socket.emit('CLIENT_GUESS_RESPONSE',data);
        this.active_player_toggle=1;
      },
      USER_COUNT_UPDATE:function(data){
        this.users=Object.keys(data[1]).length;
        delete data[1][this.my_id];
        this.users_list=data[1];
      },
  },
});
}
