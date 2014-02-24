/*
 * jQuery HTML5 Player Plugin
 */

/*

+------------------------------------------------------------------------------+
| <div id="JHTML5PLAYER_ID" class="jhtml5player">                              |
|  +------------------------------------------------------------------------+  |
|  | <div class="jhtml5player-stage">                                       |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <video class="jhtml5player-stage-video">                         |  |  |
|  |  |   or                                                             |  |  |
|  |  | <object flash class="jhtml5player-stage-video">                  |  |  |
|  |  |                                                                  |  |  |
|  |  |                                                                  |  |  |
|  |  |                                                                  |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <div class="jhtml5player-stage-logooverlay">                     |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <div class="jhtml5player-stage-subtitle">                        |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | <div class="jhtml5player-stage-play">                            |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------------+  |
|  +------------------------------------------------------------------------+  |
|  | <div class="jhtml5player-controls">                                    |  |
|  |  +------------------------------------------------------------------+  |  |
|  |  | buttons...                                                       |  |  |
|  |  +------------------------------------------------------------------+  |  |
|  +------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------+
*/

(function($) {

    var _VIDEO_EVENTS = ['click', 'mouseover', 'mouseout', 'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied', 'stalled', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'waiting', 'seeking', 'ended', 'durationchange', 'timeupdate', 'play', 'pause', 'ratechange', 'volumechange'];

    var _player_id = 0;

    function _createPlayerId() {
        _player_id ++;
        return 'J_HTML5PLAYER_ID_' + _player_id;
    }

    function _copyDict(d) {
        var nd = {};
        for (s in d) {
            nd[s] = d[s];
        }
        return nd;
    }

    /*
     * dumpCss({'.a':{'color':'red','font-size':'12px'}})
     * '.a { color: red; font-size: 12px; }'
     */
    function dumpCss(css_dict) {
        var L = [];
        for (k in css_dict) {
            L.push(k);
            L.push(' { ');
            s_dict = css_dict[k];
            if (typeof(s_dict)=='string') {
                L.push(s_dict);
            }
            else {
                for (s in s_dict) {
                    L.push(s + ':' + s_dict[s] + ';');
                }
            }
            L.push(' }\n');
        }
        return L.join('');
    }

    /*
     * dumpStyle({'color':'red','font-size':'12px'})
     * 'color: red; font-size: 12px;'
     */
    function dumpStyle(sty) {
        var L = [];
        for (s in sty) {
            L.push(s + ':' + sty[s]);
        }
        return L.join(';');
    }

    /*
     * dumpElement({'tag':'div','style':{'color':'red'}})
     * '<div style="color:red"></div>'
     */
    function dumpElement(ele) {
        var L = ['<', ele.tag];
        for (p in ele) {
            if (p!='tag' && p!='style' && p!='children') {
                L.push(' ' + p + '="' + ele[p] + '"');
            }
        }
        if (ele.style) {
            L.push(' style="' + dumpStyle(ele.style) + '"');
        }
        L.push('>');
        if (ele.children) {
            for (var i=0; i<ele.children.length; i++) {
                L.push(dumpElement(ele.children[i]));
            }
        }
        L.push('</' + ele.tag + '>');
        return L.join('');
    }

    /*
     * create css on $(document).ready().
     */
    function createCss(css_dict) {
        $(function() {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = dumpCss(css_dict);
            document.getElementsByTagName('head')[0].appendChild(style);
        });
    }

    function _createPlayerHtml(conf, player_id) {
        var skin = jhtml5player.skins[conf.skin];
        var video_srcs = [];
        if (typeof(conf.video.src)==='string') {
            video_srcs.push({'tag':'source', 'src':conf.video.src});
        }
        else {
            for (var i=0; i<conf.video.src.length; i++) {
                var src = conf.video.src[i];
                if (typeof(src)==='string') {
                    video_srcs.push({'tag':'source', 'src':src});
                }
                else {
                    video_srcs.push({'tag':'source', 'src':src.src, 'type':src.type});
                }
            }
        }
        var video_proxy = {};
        var tag_video = {
            'tag': 'video',
            'poster': conf.video.poster,
            'style': {
                'width': conf.video.width + 'px',
                'height': conf.video.height + 'px',
            },
            'children': video_srcs,
        };

        var player_div = {
            'tag': 'div',
            'id': player_id,
            'class': 'jhtml5player',
            'style': {
                'display': 'block',
                'width': conf.video.width + 'px',
                'height': (conf.video.height + skin.control_bar.height) + 'px',
                'padding': '0px',
                'margin': '0px',
                'position': 'relative',
                'box-shadow': '0px 0px 10px #999',
            },
            'children': [
                {
                    'tag': 'div',
                    'class': 'jhtml5player-stage',
                    'style': {
                        'width': conf.video.width + 'px',
                        'height': conf.video.height + 'px',
                        'position': 'relative',
                        'display': 'block',
                    },
                    'children' : [
                        tag_video,
                    ],
                },
                {
                    'tag': 'div',
                    'class': 'jhtml5player-controls',
                    'style': {
                        'display': 'block',
                        'width': conf.video.width + 'px',
                        'height': skin.control_bar.height + 'px',
                        'position': 'relative',
                        'padding': '0px',
                        'margin': '0px',
                    },
                    'children': skin.createControls(conf.video.width, skin.control_bar.height),
                }
            ],
        }
        var los = _createLogoOverlay(conf, player_id);
        for (var i=0; i<los.length; i++) {
            player_div.children[0].children.push(los[i]);
        }
        player_div.children[0].children.push(_createSubtitle(conf, player_id));
        player_div.children[0].children.push(skin.create_big_play_button(conf.video.width, conf.video.height));

        return dumpElement(player_div);
    }

    function _createPlayer(conf, player_id) {
        var skin = jhtml5player.skins[conf.skin];
        var v = $('#' + player_id + ' video').get(0);
        var subtitle = $('#' + player_id + ' span.jhtml5player-subtitle');

        var skin_proxy = skin.create_skin_proxy(player_id, v);
        $.each(_VIDEO_EVENTS, function(index, evt) {
            var handler = skin_proxy[evt];
            if (typeof(handler)=='function') {
                log('bind event ' + evt + '...');
                var f = function(e) {
                    handler();
                }
                v.addEventListener(evt, f);
            }
        });
        skin.init(player_id, v);
        return {
            'id': player_id,
            'setSubtitle': function(s) {
                subtitle.html(s);
            },
            'play': function() {
                v.play();
            },
            'pause': function() {
                if (!v.paused)
                    v.pause();
            },
            'onClickLogoOverlay': function() {
                //
            },
        };
    }

    function _createLogoOverlay(conf, player_id) {
        var tags = [];
        for (var i=0; i<conf.logooverlays.length; i++) {
            var lo = conf.logooverlays[i];
            var lo_style = _copyDict(lo.style);
            lo_style['position'] = 'absolute';
            lo_style['margin'] = '0px';
            lo_style['padding'] = '0px';
            lo_style['border'] = 'none';
            //lo_style['left'] = lo.margin_x + 'px';
            //lo_style['top'] = lo.margin_y + 'px';
            var top_bottom = lo.position.indexOf('bottom')==(-1) ? 'top' : 'bottom';
            var left_right = lo.position.indexOf('right')==(-1) ? 'left' : 'right';
            lo_style[top_bottom] = lo.marginy + 'px';
            lo_style[left_right] = lo.marginx + 'px';
            tags.push({
                'tag': 'img',
                'src': lo.image,
                'class': 'logooverlay logooverlay-' + i,
                'style': lo_style,
            });
        }
        return tags;
    }

    function _createSubtitle(conf, player_id) {
        return {
            'tag': 'div',
            'style': {
                'position': 'absolute',
                'width': conf.video.width + 'px',
                'height': '30px',
                'display': 'block',
                'left': '0px',
                'top': (conf.video.height - 30) + 'px',
                'text-align': 'center',
                'font-size': '18px',
                'font-weight': 'bold',
            },
            'children': [
                {
                    'tag': 'span',
                    'class': 'jhtml5player-subtitle',
                    'style': {
                        'opacity': '0.9',
                        'color': '#fff',
                        'text-shadow': '1px 0px #000, 0px 1px #000, 0px -1px #000, -1px 0px #000',
                    },
                }
            ],
        };
    }

    function log(s) {
        console.log(s);
    }

    // export functions:

    window['jhtml5player'] = {
        'skins': {}
    };

    jhtml5player.dumpCss = dumpCss;
    jhtml5player.createCss = createCss;
    jhtml5player.registerSkin = function registerSkin(name, skin_object) {
        jhtml5player.skins[name] = skin_object;
    };
    jhtml5player.requestFullScreen = function(player_id) {
        var $dom = $('#' + player_id).get(0);
        if ($dom.requestFullScreen) {
            $dom.requestFullScreen();
        }
        else if ($dom.webkitRequestFullScreen) {
            $dom.webkitRequestFullScreen();
        }
        else if ($dom.mozRequestFullScreen) {
            $dom.mozRequestFullScreen();
        }
    };
    jhtml5player.log = log

    // extend jquery:

    $.fn.extend({
        createPlayer: function() {
            var conf = arguments[0] || {};
            var logooverlays = [];
            if ( ! $.isArray(conf.logooverlays)) {
                conf.logooverlays = [conf.logooverlays];
            }

            var player_id = _createPlayerId();
            $(this).html(_createPlayerHtml(conf, player_id));
            var player = _createPlayer(conf, player_id);
            $('#' + player_id).data('player', player);
            for (var i=0; i<conf.logooverlays.length; i++) {
                var lo = conf.logooverlays[i];
                var o = $('#' + player_id + ' img.logooverlay-' + i);
                if (lo.click) {
                    o.click(lo.click);
                }
                o.hover(lo.mouseover || function() {}, lo.mouseout || function() {});
            }
            return player;
        }
    });
})(jQuery);
