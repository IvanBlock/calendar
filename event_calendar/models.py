from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class Event(models.Model):
    name = models.CharField(max_length=60, verbose_name='Название события')
    event_type = models.CharField(max_length=20, verbose_name='Тип события')
    start = models.DateTimeField(verbose_name='Начало события')
    end = models.DateTimeField(null=True, blank=True, verbose_name="Конец события")
    '''days_to_repeat = ArrayField(
            models.CharField(max_length=1, blank=True),
            size=7, null=True
        )'''
    days_to_repeat = models.CharField(max_length=23, verbose_name='Дни повторения', blank=True)

type_tuple = (('first', 'Тип1'),
    ('second', 'Тип2'),
    ('third', 'Тип3'),
    ('forth', 'Тип4')
              )
