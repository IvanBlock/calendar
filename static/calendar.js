$.ajaxSetup({
    beforeSend: function (xhr, settings) {
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

$.datetimepicker.setLocale('ru');

$(document).ready(function () {

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
        events: function (start, end, timezone, callback) {
            $.ajax({
                type: 'POST',
                url: '/get/',
                dataType: 'json',
                data: {
                    start: moment(start).format("YYYY-MM-DD"),
                    end: moment(end).format("YYYY-MM-DD")
                },
                success: function (data) {
                    callback(data.content);
                }
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

    $('#days').hide();
    $('#labelDays').hide();

    $('#newPeriodStart').hide();
    $('#newPeriodEnd').hide();
    $('#labelPeriodEnd').hide();
    $('#labelPeriodStart').hide();

    $('#labelYearStart').hide();
    $('#yearStart').hide();
    $('#labelYearEnd').hide();
    $('#yearEnd').hide();

    $('#repeatType').change(function () {
        if ($('#repeatType option:selected').val() == 'week') {
            $('#days').show();
            $('#labelDays').show();

            $('#labelYearStart').hide();
            $('#yearStart').hide();
            $('#labelYearEnd').hide();
            $('#yearEnd').hide();

            $('#newPeriodStart').hide();
            $('#newPeriodEnd').hide();
            $('#labelPeriodEnd').hide();
            $('#labelPeriodStart').hide();
        } else if ($('#repeatType option:selected').val() == 'month') {

            $('#newPeriodStart').show();
            $('#newPeriodEnd').show();
            $('#labelPeriodEnd').show();
            $('#labelPeriodStart').show();

            $('#labelYearStart').hide();
            $('#yearStart').hide();
            $('#labelYearEnd').hide();
            $('#yearEnd').hide();

            $('#days').hide();
            $('#labelDays').hide();
        } else if ($('#repeatType option:selected').val() == 'year') {

            $('#labelYearStart').show();
            $('#yearStart').show();
            $('#labelYearEnd').show();
            $('#yearEnd').show();

            $('#newPeriodStart').hide();
            $('#newPeriodEnd').hide();
            $('#labelPeriodEnd').hide();
            $('#labelPeriodStart').hide();
            $('#days').hide();
            $('#labelDays').hide();
        } else {

            $('#labelYearStart').hide();
            $('#yearStart').hide();
            $('#labelYearEnd').hide();
            $('#yearEnd').hide();
            $('#newPeriodStart').hide();
            $('#newPeriodEnd').hide();
            $('#labelPeriodEnd').hide();
            $('#labelPeriodStart').hide();
            $('#days').hide();
            $('#labelDays').hide();
        }
    });
    $('#newEventStart').datetimepicker({
        closeOnTimeSelect: true,
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#newEventEnd').val() ? $('#newEventEnd').val() : false
            })
        }
    });
    $('#newEventEnd').datetimepicker({
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#newEventStart').val() ? $('#newEventStart').val() : false
            })
        }
    });

    $('#newPeriodStart').datetimepicker({
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#newPeriodEnd').val() ? $('#newPeriodEnd').val() : false
            })
        }
    });

    $('#newPeriodEnd').datetimepicker({
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#newPeriodStart').val() ? $('#newPeriodStart').val() : false
            })
        }
    });


    $('#createEvent').click(function () {

        var dow = [];

        $("#days :selected").each(function (i, selected) {
            dow.push($(selected).val());
        });

        var repeat = new Object();
        repeat.type = $("#repeatType option:selected").val();
        if (repeat.type) {
            repeat.type == 'week' ? repeat.dow = JSON.stringify(dow) : null;
            if (repeat.type == 'month') {
                repeat.periodStart = moment($('#newPeriodStart').datetimepicker('getValue')).format("YYYY-MM-DD");
                repeat.periodEnd = moment($('#newPeriodEnd').datetimepicker('getValue')).format("YYYY-MM-DD");
            } else if (repeat.type == 'year') {
                repeat.periodStart = moment(new Date($("#yearStart option:selected").val(), 0)).format("YYYY-MM-DD");
                repeat.periodEnd = moment(new Date($("#yearEnd option:selected").val(), 0)).format("YYYY-MM-DD");
            }
        }

        $.ajax({
            type: 'POST',
            url: 'add/',
            data: {
                title: $('#newEventTitle').val(),
                type: $("#newEventType option:selected").val(),
                repeat: repeat,
                dow: JSON.stringify(dow),
                start: moment($('#newEventStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                end: moment($('#newEventEnd').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS")
            },
            cache: false,
            success: function (data) {
                $('#calendar').fullCalendar('refetchEvents');
            }.bind(this),
            error: function () {
                console.log("Ошибка при попытке создания")
            }.bind(this)
        });
    });
})
;


var onEventClick = function (event, element) {

    $("#delete").click(function () {

        $.ajax({
            type: 'POST',
            url: 'delete/',
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
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#eventEnd').val() ? $('#eventEnd').val() : false
            })
        }
    });

    $('#eventEnd').datetimepicker({
        value: event.end == null ? null : event.end.format('YYYY MM DD HH:mm'),
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#eventStart').val() ? $('#eventStart').val() : false
            })
        }
    });

    $('#periodStart').datetimepicker({
        value: event.periodStart != null ? event.periodStart.format('YYYY MM DD') : null,
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                maxDate: $('#periodEnd').val() ? $('#periodEnd').val() : false
            })
        }
    });

    $('#periodEnd').datetimepicker({
        value: event.periodEnd != null ? event.periodEnd.format('YYYY MM DD') : null,
        timepicker: false,
        onShow: function (ct) {
            this.setOptions({
                minDate: $('#periodStart').val() ? $('#periodStart').val() : false
            })
        }
    });

    $("#update").click(function () {

        if ($('#eventStart').datetimepicker('getValue') > $('#eventEnd').datetimepicker('getValue')) {
            alert("Дата начала не может быть больше даты конца");
        } else {

            $.ajax({
                type: 'POST',
                url: 'update/url',
                data: {
                    id: event.id,
                    start: moment($('#eventStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                    end: moment($('#eventEnd').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                    periodStart: moment($('#periodStart').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                    periodEnd: moment($('#periodEnd').datetimepicker('getValue')).format("YYYY-MM-DD HH:MM:SS"),
                    type: $("#eventType option:selected").val(),
                    title: $('#eventTitle').val()
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

