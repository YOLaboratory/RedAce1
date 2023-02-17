var flag_menu=false;
var flag_menu2=false;

$(function() {
    $('#menu').hide(); //umemo メニュー欄隠しておく
    $('#menubutton').click(function(){ //umemo メニューボタン、3段階
        if(!flag_menu && !flag_menu2){ 
            $('#body').animate({'top':'70px'},200);
            $('#menu').slideToggle(200);
            flag_menu=true;
            flag_menu2=true;
        }else if(flag_menu && flag_menu2){
            $('#body').animate({'top':'0px'},200);
            flag_menu=false;
            flag_menu2=true;
        }else if(!flag_menu && flag_menu2){
            $('#menu').slideToggle(200);
            flag_menu=false;
            flag_menu2=false;
        }
        return false;
    });
});