var events;

$.ajaxSetup({
     beforeSend: function(xhr, settings) {
         function getCookie(name) {
             var cookieValue = null;
             if (document.cookie && document.cookie != '') {
                 var cookies = document.cookie.split(';');
                 for (var i = 0; i < cookies.length; i++) {
                     var cookie = jQuery.trim(cookies[i]);
                     // Does this cookie string begin with the name we want?
                     if (cookie.substring(0, name.length + 1) == (name + '=')) {
                         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                         break;
                     }
                 }
             }
             return cookieValue;
         }
         if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
             // Only send the token to relative URLs i.e. locally.
             xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
         }
     }
});

$.ajax({
    type: 'POST',
    url: '/get/',
    dataType: 'json',
    cache: false,
    success: function (data) {
        events = data;
        $('#calendar').fullCalendar('refetchEvents');
    }.bind(this),
    error: function () {
        console.log("Ошибка получения данных")
    }.bind(this)
});

$.datetimepicker.setLocale('ru');

$(document).ready(function () {

    $("#create").click(onCreateClick);


    $('#calendar').fullCalendar({
        lang: 'ru',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,basicWeek,basicDay'
        },
        defaultDate: new Date(),
        navLinks: true,
        editable: true,
        eventLimit: true,
        events: events,
        viewRender: function (view, element) {

            $.ajax({
                type: 'POST',
                url: '/get/', //fixme: get events
                dataType: 'json',
                cache: false,
                data: {
                    start: moment(view.start).format("YYYY-MM-DD"),
                    end: moment(view.end).format("YYYY-MM-DD")
                },
                success: function (data) {
                    console.log(data);
                    events = data.content;
                    $('#calendar').fullCalendar('removeEvents');
                    $('#calendar').fullCalendar('addEventSource', events);
                    $('#calendar').fullCalendar('refetchEvents');
                }.bind(this),
                error: function () {
                    console.log("Ошибка получения данных")
                }.bind(this)
            });
        },
        eventRender: function (event, element) {
            if (event.type == "first") {
                element.css('background-color', 'indianred');
            } else if (event.type == "second") {
                element.css('background-color', 'green');
            } else if (event.type == "third") {
                element.css('background-color', 'orange');
            } else if (event.type == "fourth") {
                element.css('background-color', 'blue');
            }
        },
        eventClick: onEventClick
    });

    /*$('button.fc-prev-button').click(function () {
        console.log($('#calendar').fullCalendar('getDate').format('MM'));
    });

    $('button.fc-next-button').click(function () {
        console.log($('#calendar').fullCalendar('getDate').format('MM'));
    });*/

});

var onCreateClick = function () {
    $("#modalForCreate").modal('show');
    $('#newEventStart').datetimepicker({format:'d.m.Y H:i'});
    $('#newEventEnd').datetimepicker({format:'d.m.Y H:i'});

    $('#createEvent').click(function () {


        $.ajax({
            type: 'POST',
            url: 'add/', //fixme: create url
            data: {
                title: $('#newEventTitle').val(),
                type: $("#newEventType option:selected").val(),
                start: moment($('#newEventStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                end: moment($('#newEventStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS")
            },
            cache: false,
            success: function (data) {
                $('#calendar').fullCalendar('refetchEvents');

            }.bind(this),
            error: function () {
                console.log("Ошибка при попытке создания")
            }.bind(this)
        });

    })
};


var onEventClick = function (event, element) {

    $("#delete").click(function () {

        $.ajax({
            type: 'POST',
            url: 'delete/url', //fixme: delete url
            data: {id: event.id},
            cache: false,
            success: function (data) {
                $('#calendar').fullCalendar('refetchEvents');

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
                    typeEvent: $("#eventType option:selected").val(),
                    endEvent: $('#eventEnd').datetimepicker('getValue')
                },
                cache: false,
                success: function (data) {
                    $('#calendar').fullCalendar('refetchEvents');

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

