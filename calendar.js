var events;
$.ajax({
    url: 'events.json',
    dataType: 'json',
    cache: false,
    success: function (data) {
        events = data;
    }.bind(this),
    error: function () {
        console.log("Ошибка получения данных")
    }.bind(this)
});

$.datetimepicker.setLocale('ru');


$(document).ready(function () {

    $("#create").click(function () {
        console.log(213);
    });

    $('#calendar').fullCalendar({
        lang: 'ru',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
        },
        defaultDate: '2016-09-12',
        navLinks: true, // can click day/week names to navigate views
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: events,
        eventClick: onEventClick
    });

});



var onEventClick = function (event, element) {

    $("#delete").click(function () {
        $.ajax({
            type: 'POST',
            url: 'delete/url', //fixme: delete url
            data: event.id,
            cache: false,
            success: function (data) {
                //nothing
            }.bind(this),
            error: function () {
                console.log("Ошибка при попытке удаления")
            }.bind(this)
        });

        $("#myModal").modal('hide');
    });

    $("#eventTitle").val(event.title);

    $('#eventStart').datetimepicker({
        value: event.start.format('YYYY MM DD HH:mm'),
        minDate: 0,
        onSelectDate: function (date) {
            $('#eventEnd').datetimepicker('options', {minDate: date});
        },
        onSelectTime: function (time) {
            console.log(time);
            $('#eventEnd').datetimepicker('setOptions', {minTime: this.minDate == this.value ? time : null});
        }
    });


    var end = event.end;

    $('#eventEnd').datetimepicker({
        value: event.end == null ? null : event.end.format('YYYY MM DD HH:mm'),
        onSelectDate: function (date) {
            $('#eventStart').datetimepicker('setOptions', {maxDate: date, maxTime: date});
        }
    });

    if (end == null) {
        $('#eventEnd').datetimepicker('reset');
    }

    $("#update").click(function () {

        if ($('#eventStart').datetimepicker('getValue') > $('#eventEnd').datetimepicker('getValue')) {
            alert("Дата начала не может быть больше даты конца");
        } else {

            $.ajax({
                type: 'POST',
                url: 'update/url', //fixme: update url
                data: {
                    id: event.id,
                    startEvent: $('#eventStart').datetimepicker('getValue'),
                    endEvent: $('#eventEnd').datetimepicker('getValue')
                },
                cache: false,
                success: function (data) {
                    //nothing
                }.bind(this),
                error: function () {
                    console.log("Ошибка при попытке обновления")
                }.bind(this)
            });

            $("#myModal").modal('hide');
        }
    });

    $("#myModal").modal('show');
    $('#calendar').fullCalendar('updateEvent', event);

};

