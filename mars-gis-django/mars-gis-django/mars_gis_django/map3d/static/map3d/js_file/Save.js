function save_spectral(counter) {
    console.log('save_spectral here!!');
    console.log(dataSave[counter]);

    let graphCounter = counter + 1;
    let description = document.getElementById(`save_memo_${graphCounter}`).value;

    console.log(description);

    $.ajax({
        type: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        url: '/spectra/spectrum/new',
        contentType: 'application/json',
        data: JSON.stringify({
            spectral_data: dataSave[counter],
            description: description,
        }),
    });

    document.getElementById(`save_memo_${graphCounter}`).value = '';
    alert('Save completed!!!');
}

$(function () {
    let $body = $('body');

    $('#annotate_spectra').on('click', function () {
        console.log('aakdkdkdkdoaednfiaernf');
        $(body).toggleClass('annotate_open');
    });
});

function update_description(id) {
    console.log(id);
    console.log(typeof id);

    let description_new = document.getElementById(id).value;

    console.log(description_new);
    console.log(typeof description_new);
}
