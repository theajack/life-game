/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-03 22:02:12
 * @Description: Coding something
 */
pub fn set_bit(num: u8, n: u8, is_one: u8) -> u8 {
    let v = 1 << (8 - n);
    if is_one == 1 {
        num | v
    } else {
        num & !v
    }
}

pub fn get_bit(num: u8, n: u8) -> u8 {
    let offset = 8 - n;
    (num & (1 << offset)) >> offset
}

/* 工具函数 */

// 坐标 转 index offset, 坐标从0开始
// 返回 (index, offset)
// width 为地图实际尺寸, x,y为实际地图坐标
// x,y从0开始，width也是0-255
pub fn pos_to_index_offset(x: u8, y: u8, width: u8) -> (usize, u8) {
    let pos_index = (y * width + x) as usize;
    (
        (pos_index >> 3),      // 除8取整 获取第几个u8 index
        (pos_index & 7) as u8, // 除8取余 获取u8中的偏移 offset
    )
}

pub fn index_offset_to_pos(index: usize, offset: u8, width: u8) -> (u8, u8) {
    let pos_index = index * 8 + offset as usize;

    (
        (pos_index % width as usize) as u8, // x
        (pos_index / width as usize) as u8, // y
    )
}
