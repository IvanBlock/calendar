from django.db import models

# Create your models here.

type_tuple = (('first', 'Тип1'),
    ('second', 'Тип2'),
    ('third', 'Тип3'),
    ('forth', 'Тип4')
              )

repeat_type_tuple = (('week', 'Раз в неделю'),
    ('month', 'Раз в месяц'),
    ('year', 'Раз в год'),
              )


class Event(models.Model):
    name = models.CharField(max_length=60, verbose_name='Название события')
    event_type = models.CharField(max_length=20, verbose_name='Тип события', choices=type_tuple)
    start = models.DateTimeField(verbose_name='Начало события')
    end = models.DateTimeField(null=True, blank=True, verbose_name="Конец события")
    '''days_to_repeat = ArrayField(
            models.CharField(max_length=1, blank=True),
            size=7, null=True
        )'''


class RepeatingEvent(models.Model):
    name = models.CharField(max_length=60, verbose_name='Название события')
    event_type = models.CharField(max_length=20, verbose_name='Тип события')
    start = models.DateTimeField(verbose_name='Первая итерация')
    end = models.DateTimeField(null=True, blank=True, verbose_name="Последняя итерация")
    repeat_type = models.CharField(max_length=20, verbose_name="Как повторять", choices=repeat_type_tuple)
    repeat_rules = models.CharField(max_length=50, verbose_name="Правила повторения")


