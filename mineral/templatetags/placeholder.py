import os
import re
try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO
# Try to import PIL in either of the two ways it can end up installed.
try:
    from PIL import ImageFont, ImageDraw, Image
except ImportError:
    import ImageFont, ImageDraw, Image
from django import template
import ttag

from django.utils.safestring import mark_safe

register = template.Library()


def create_placeholder(size, text=None, background='#f2f2f2', border='#ddd',
                       text_color='#999', text_size=12, antialias=True):
    original_size = size
    if antialias:
        size = [value * 3 for value in size]
        text_size *= 3
    right_x, right_y = size[0] - 1, size[1] - 1
    img = Image.new('RGB', size, background)
    draw = ImageDraw.Draw(img)
    for i in range(0, antialias and 3 or 1):
        draw.rectangle((i, i, size[0] - 1 - i, size[1] - 1 - i),
                       outline=border)
    width = antialias and 2 or 1
    draw.line((0, 0, size[0] - 1, size[1] - 1), border, width=width)
    draw.line((0, size[1] - 1, size[0] - 1, 0), border, width=width)
    font = ImageFont.load_default()
    font = ImageFont.truetype(os.path.join(os.path.dirname(__file__),
                                           'FreeSans.ttf'), text_size)
    if text:
        text_size = draw.textsize(text, font=font)
        draw.text(((img.size[0] - text_size[0]) // 2,
                   (img.size[1] - text_size[1]) // 2),
                  text, fill=text_color, font=font)
    size_text = '%sx%s' % tuple(original_size)
    font = ImageFont.truetype(
        os.path.join(os.path.dirname(__file__),'FreeSans.ttf'),
        9 * (antialias and 3 or 1)
    )
    size_text_size = draw.textsize(size_text, font=font)
    size_text_y = img.size[1] - size_text_size[1]
    if not text or (img.size[1] + text_size[1]) // 2 < size_text_y:
        draw.text(((img.size[0] - size_text_size[0]) // 2,
                   size_text_y),
                  size_text, fill=text_color, font=font)
    if antialias:
        img = img.resize(original_size, Image.ANTIALIAS)
    return img


class SizeArg(ttag.Arg):

    def clean(self, value):
        if value:
            if isinstance(value, basestring):
                value = value.split('x')
            try:
                value = tuple([int(i) for i in value])
            except (TypeError, ValueError):
                value = ()
            if len(value) != 2 or min(value) < 0:
                raise ttag.TagValidationError('Invalid size')
        return value

    def compile_filter(self, parser, value, *args, **kwargs):
        if re.match(r'\d+x\d+$', value):
            return value
        return super(SizeArg, self).compile_filter(parser=parser, value=value,
                                                   *args, **kwargs)


class Placeholder(ttag.Tag):
    """
    Outputs an ``<img>`` tag containing an inline base64 encoded placeholder
    image. For example::

        {% placeholder 100x30 "some text" %}

    The text is optional. Some optional keyword arguments are available which
    can be used to adjust the output image:

    ``background``
        The background color of the placeholder image.
    ``border``
        The border color (and also that of the 'x' lines crossing the image).
    ``text_color``
        The color of the text.
    ``text_size``
        The size of the text.
    ``class``
        The HTML class to use for this image tag.
    ``no_antialias``
        Don't antialias the final image.
    """
    size = SizeArg()
    text = ttag.Arg(required=False)
    background = ttag.Arg(keyword=True, required=False)
    border = ttag.Arg(keyword=True, required=False)
    text_color = ttag.Arg(keyword=True, required=False)
    text_size = ttag.IntegerArg(keyword=True, required=False)
    class_ = ttag.Arg(keyword=True, required=False)
    no_antialias = ttag.BooleanArg()

    def clean(self, cleaned_data):
        cleaned_data['antialias'] = not cleaned_data.pop('no_antialias', None)
        return cleaned_data

    def output(self, data):
        img = StringIO()
        html_class = data.pop('class', None)
        create_placeholder(**data).save(img, 'PNG')
        img.seek(0)
        return mark_safe('<img alt="%s" src="data:image/png;base64,%s" %s/>'
                         % (data.get('text') or '',
                            img.read().encode('base64'),
                            html_class and ' class="%s"' % html_class or ''))


register.tag(Placeholder)

