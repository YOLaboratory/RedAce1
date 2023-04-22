function save_spectral(counter) {
    console.log("save_spectral here!!");
    console.log(data_save[counter]);

    var graph_counter = counter + 1;
    var memo_counter = "save_memo_" + graph_counter.toString();
    var description = document.getElementById(memo_counter).value;

    console.log(description);

    $.ajax({
        type: 'POST',
        headers: { "X-CSRFToken": csrftoken },
        url: '/spectra/spectrum/new',
        contentType: 'application/json',
        data: JSON.stringify({
            "spectral_data": data_save[counter],
            "description": description
        })
    })

    alert('Save completed!!!');
}

$(function () {
    var $body = $('body');
    
    $('#annotate_spectra').on('click', function () {
     console.log("aakdkdkdkdoaednfiaernf");
        $(body).toggleClass('annotate_open');
    });
});



function update_description(id){
    console.log(id)
    console.log(typeof(id))

    var description_new = document.getElementById(id).value;
    
    console.log(description_new)
    console.log(typeof(description_new));
}
